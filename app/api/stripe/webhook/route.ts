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
        // Idempotent: only the first transition to "paid" matches, so a replayed
        // webhook won't re-trigger confirmation side-effects.
        const updated = await Order.findOneAndUpdate(
          { _id: orderId, paymentStatus: { $ne: "paid" } },
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
      if (piId) {
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
