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
    const { amount, orderId, items, address } = await req.json();
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
              description: items?.map((i: any) => `${i.name} × ${i.qty}`).join(", ").slice(0, 500),
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: address?.email,
      metadata: { orderId },
      success_url: `${baseUrl}/order-success?id=${orderId}&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
    });

    await connectDB();
    await Order.findByIdAndUpdate(orderId, { paymentIntentId: session.id });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
