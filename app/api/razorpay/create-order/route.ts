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
    const { amount, orderId } = await req.json();
    if (!amount || !orderId) {
      return NextResponse.json({ error: "amount & orderId required" }, { status: 400 });
    }
    const rp = getRazorpay();
    const rpOrder = await rp.orders.create({
      amount: Math.round(amount * 100), // paisa
      currency: "INR",
      receipt: orderId,
      notes: { internalOrderId: orderId },
    });

    await connectDB();
    await Order.findByIdAndUpdate(orderId, { razorpayOrderId: rpOrder.id });

    return NextResponse.json({
      id: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
