import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendOrderConfirmation } from "@/lib/order-confirmation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/webhook
 * Wire this URL in Stripe Dashboard → Developers → Webhooks.
 * Subscribe to: checkout.session.completed, charge.refunded.
 */
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !whSecret) {
    return NextResponse.json({ error: "missing signature/secret" }, { status: 400 });
  }
  const stripe = getStripe();
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch (e: any) {
    return NextResponse.json({ error: `Webhook error: ${e.message}` }, { status: 400 });
  }

  await connectDB();

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      // Only mark paid when Stripe has actually collected the money.
      // Async payment methods (e.g. bank transfer) complete the session before
      // funds clear; guard against marking as paid prematurely.
      if (s.payment_status !== "paid") break;
      const orderId = s.metadata?.orderId;
      if (orderId) {
        // Idempotent: only a pre-paid order matches, so a replayed webhook
        // won't re-trigger confirmation side-effects. Matching on
        // `{ $ne: "paid" }` would also match "refunded" — a redelivered
        // checkout.session.completed (Stripe's delivery is at-least-once;
        // a dashboard "Resend" hits this too) arriving AFTER a refund would
        // then flip the order straight back to "paid", erasing the refund.
        const updated = await Order.findOneAndUpdate(
          { _id: orderId, paymentStatus: { $in: ["unpaid", "failed"] } },
          { paymentStatus: "paid", status: "paid", paymentIntentId: s.payment_intent as string },
          { new: true }
        );
        if (updated) await sendOrderConfirmation(orderId);
      }
      break;
    }
    case "charge.refunded": {
      // Charge objects do NOT inherit checkout.session metadata — look up the
      // order via paymentIntentId (stored in the paid webhook above).
      const c = event.data.object as Stripe.Charge;
      const piId = typeof c.payment_intent === "string" ? c.payment_intent : null;
      // Only mark the order fully refunded on a FULL refund. A partial refund
      // (e.g. ₹100 goodwill on a ₹2000 order) must not drop the whole order out
      // of fulfillment — the customer still paid the balance.
      const fullyRefunded = c.refunded === true || (c.amount_refunded ?? 0) >= (c.amount ?? 0);
      if (piId && fullyRefunded) {
        await Order.findOneAndUpdate(
          { paymentIntentId: piId, paymentStatus: { $ne: "refunded" } },
          { paymentStatus: "refunded", status: "refunded" }
        );
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
