import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendOrderConfirmation } from "@/lib/order-confirmation";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/razorpay/webhook
 * Wire this URL in Razorpay Dashboard → Settings → Webhooks.
 * Subscribe to: payment.captured, payment.failed, payment.refunded.
 *
 * Server-to-server confirmation, independent of the customer's browser.
 * Without this, a payment only gets marked "paid" if the customer's tab
 * stays open long enough for /api/razorpay/verify's client-side handler to
 * fire — closing the tab right after paying left the order "unpaid" forever
 * despite Razorpay having actually collected the money, with no way to
 * reconcile it after the fact.
 */
export async function POST(req: Request) {
  const sig = req.headers.get("x-razorpay-signature");
  const whSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!sig || !whSecret) {
    return NextResponse.json({ error: "missing signature/secret" }, { status: 400 });
  }

  const body = await req.text();

  // Razorpay's documented webhook formula: hmac_sha256(raw body, webhook secret),
  // hex-encoded. Same constant-time comparison pattern as /api/razorpay/verify.
  const expected = crypto.createHmac("sha256", whSecret).update(body).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  let sigBuf: Buffer;
  try {
    sigBuf = Buffer.from(sig, "hex");
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }
  if (expectedBuf.length !== sigBuf.length || !crypto.timingSafeEqual(expectedBuf, sigBuf)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  await connectDB();

  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      const razorpayPaymentId = payment?.id;
      if (razorpayOrderId && razorpayPaymentId) {
        // Idempotent: only a pre-paid order matches, so a redelivered webhook
        // (Razorpay retries on non-2xx, same as Stripe) can't re-trigger
        // confirmation side-effects or resurrect a refunded order back to
        // "paid" — the exact bug already fixed on the Stripe side.
        const updated = await Order.findOneAndUpdate(
          { razorpayOrderId, paymentStatus: { $in: ["unpaid", "failed"] } },
          { paymentStatus: "paid", status: "paid", razorpayPaymentId },
          { new: true }
        );
        if (updated) await sendOrderConfirmation(updated._id.toString());
      }
      break;
    }
    case "payment.failed": {
      const payment = event.payload?.payment?.entity;
      const razorpayOrderId = payment?.order_id;
      if (razorpayOrderId) {
        // Only downgrade a still-unpaid order — if payment.captured already
        // arrived (or the customer retried, which overwrites razorpayOrderId
        // on the order with a fresh one), this correctly becomes a no-op.
        await Order.findOneAndUpdate(
          { razorpayOrderId, paymentStatus: "unpaid" },
          { paymentStatus: "failed" }
        );
      }
      break;
    }
    case "payment.refunded": {
      const payment = event.payload?.payment?.entity;
      const razorpayPaymentId = payment?.id;
      // Only mark fully refunded — a partial refund must not drop the order
      // out of fulfillment (same rule as the Stripe refund handler).
      const fullyRefunded =
        payment?.refund_status === "full" || (payment?.amount_refunded ?? 0) >= (payment?.amount ?? 0);
      if (razorpayPaymentId && fullyRefunded) {
        await Order.findOneAndUpdate(
          { razorpayPaymentId, paymentStatus: { $ne: "refunded" } },
          { paymentStatus: "refunded", status: "refunded" }
        );
      }
      break;
    }
  }

  return NextResponse.json({ status: "ok" });
}
