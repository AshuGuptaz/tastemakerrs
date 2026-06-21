import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { WebhookEvent } from "@/models/WebhookEvent";
import { sendOrderConfirmation, sendAdminOrderAlert } from "@/lib/email";
import { decrementStock } from "@/lib/inventory";
import { incrementCouponUsage } from "@/lib/coupons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/webhook
 * Wire this URL in Stripe Dashboard → Developers → Webhooks.
 * Subscribe to: checkout.session.completed, checkout.session.expired,
 * checkout.session.async_payment_failed, charge.refunded.
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

  // Idempotency: record the event id; a duplicate key means we already handled it.
  try {
    await WebhookEvent.create({ eventId: event.id });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ received: true });
    }
    console.error("Webhook idempotency write failed:", e);
    return NextResponse.json({ received: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const orderId = s.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (
          order &&
          s.payment_status === "paid" &&
          (s.currency || "").toLowerCase() === "inr" &&
          s.amount_total === Math.round(order.total * 100)
        ) {
          await Order.updateOne(
            { _id: orderId, status: { $nin: ["refunded", "cancelled"] } },
            {
              $set: {
                paymentStatus: "paid",
                status: "paid",
                paymentIntentId: s.payment_intent as string,
              },
            }
          );

          // Fire-and-forget side effects. The WebhookEvent idempotency guard
          // above prevents duplicate processing, so this won't double-fire.
          try {
            order.paymentStatus = "paid";
            order.status = "paid";
            order.paymentIntentId = s.payment_intent as string;
            await Promise.allSettled([
              sendOrderConfirmation(order),
              sendAdminOrderAlert(order),
              decrementStock(order.items),
              incrementCouponUsage(order.coupon),
            ]);
          } catch (sideEffectErr) {
            console.error("stripe webhook side effects failed:", sideEffectErr);
          }
        } else {
          console.error("checkout.session.completed verification failed for order", orderId, {
            payment_status: s.payment_status,
            currency: s.currency,
            amount_total: s.amount_total,
          });
        }
      }
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const s = event.data.object as Stripe.Checkout.Session;
      const orderId = s.metadata?.orderId;
      if (orderId) {
        await Order.updateOne(
          { _id: orderId, paymentStatus: "unpaid", status: "pending" },
          { $set: { paymentStatus: "failed", status: "cancelled" } }
        );
      }
      break;
    }
    case "charge.refunded": {
      const c = event.data.object as Stripe.Charge;
      const orderId = c.metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: "refunded", status: "refunded" });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
