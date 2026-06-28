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
    const paise = Math.round(amount * 100);
    if (!Number.isFinite(paise) || paise < 100) {
      return NextResponse.json({ error: "Minimum order amount is ₹1 (100 paise)" }, { status: 400 });
    }
    const rp = getRazorpay();
    const rpOrder = await rp.orders.create({
      amount: paise,
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
    // Map Razorpay auth failures to 401; everything else is a 500.
    const status = e?.statusCode === 401 ? 401 : 500;
    return NextResponse.json({ error: e?.error?.description || e?.message || "Razorpay order failed" }, { status });
  }
}
