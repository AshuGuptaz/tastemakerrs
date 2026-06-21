import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getRazorpay } from "@/lib/razorpay";

/**
 * POST /api/razorpay/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
 * Verifies the HMAC signature and the captured amount, then marks the order as
 * paid via an idempotent, state-conditional update.
 */
export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await req.json();
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return NextResponse.json({ ok: false, error: "RZP secret missing" }, { status: 500 });

    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }

    // Bind the payment to OUR order's razorpay order id.
    if (order.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ ok: false, error: "Order mismatch" }, { status: 400 });
    }

    // Confirm the captured amount matches our server-computed total.
    const pay = await getRazorpay().payments.fetch(razorpay_payment_id);
    if (Number(pay.amount) !== Math.round(order.total * 100) || pay.status !== "captured") {
      return NextResponse.json({ ok: false, error: "Payment amount mismatch" }, { status: 400 });
    }

    const result = await Order.updateOne(
      { _id: orderId, razorpayOrderId: razorpay_order_id, paymentStatus: "unpaid", status: "pending" },
      { $set: { paymentStatus: "paid", status: "paid", razorpayPaymentId: razorpay_payment_id } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ ok: false, error: "Order already processed" }, { status: 409 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("POST /api/razorpay/verify failed:", e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
