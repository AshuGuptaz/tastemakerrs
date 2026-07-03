import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

/**
 * POST /api/stripe/create-checkout
 * Body: { orderId: string }
 *
 * Amount is loaded from the DB (never trusted from the client).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId: string | undefined = body?.orderId;
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 400 });
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const itemNames = (order.items || [])
      .map((i: any) => `${i.name} × ${i.qty}`)
      .join(", ")
      .slice(0, 500);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "The Taste Makerrs — Order",
              description: itemNames || undefined,
            },
            unit_amount: Math.round(order.total * 100),
          },
          quantity: 1,
        },
      ],
      customer_email: order.address?.email,
      metadata: { orderId },
      success_url: `${baseUrl}/order-success?id=${orderId}&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout`,
    });

    await Order.findByIdAndUpdate(orderId, { paymentIntentId: session.id });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error("[stripe/create-checkout]", e?.message);
    return NextResponse.json({ error: "Checkout session creation failed" }, { status: 500 });
  }
}
