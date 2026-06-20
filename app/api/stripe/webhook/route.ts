import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

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
      const orderId = s.metadata?.orderId;
      if (orderId) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "paid",
          status: "paid",
          paymentIntentId: s.payment_intent as string,
        });
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
