import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

/**
 * POST /api/stripe/create-checkout
 * Creates a Stripe Checkout Session (hosted page) and returns the redirect URL.
 *
 * NOTE: We use a single line_item with the cart total so this works for INR carts
 * even though Stripe doesn't natively let users pay in INR from all countries.
 * Adjust currency / line items per your preferred Stripe configuration.
 */
export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    // Server price authority: load OUR order and derive amount/description from it.
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "The Taste Makerrs — Order",
              description: order.items.map((i: any) => `${i.name} × ${i.qty}`).join(", ").slice(0, 500),
            },
            unit_amount: Math.round(order.total * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: order.address?.email,
      metadata: { orderId },
      // Propagate orderId to the PaymentIntent so charge.refunded can resolve it.
      payment_intent_data: { metadata: { orderId } },
      success_url: `${baseUrl}/order-success?id=${orderId}&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
    });

    await Order.findByIdAndUpdate(orderId, { stripeSessionId: session.id });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("POST /api/stripe/create-checkout failed:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
