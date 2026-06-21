import { NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

/**
 * POST /api/razorpay/create-order
 * Body: { amount: number (INR), orderId: string }  // orderId is OUR DB id
 * Returns Razorpay order { id, amount, currency }
 */
export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    // Server price authority: derive the charge amount from our own order, never
    // from the client. Load the order BEFORE creating the Razorpay order.
    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const rp = getRazorpay();
    const rpOrder = await rp.orders.create({
      amount: Math.round(order.total * 100), // paisa
      currency: "INR",
      receipt: orderId,
      notes: { internalOrderId: orderId },
    });

    await Order.findByIdAndUpdate(orderId, { razorpayOrderId: rpOrder.id });

    return NextResponse.json({
      id: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
    });
  } catch (e: any) {
    console.error("POST /api/razorpay/create-order failed:", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
