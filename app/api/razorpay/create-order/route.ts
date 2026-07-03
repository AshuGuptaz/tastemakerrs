import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { getRazorpay } from "@/lib/razorpay";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { otpEnabled } from "@/lib/notify";
import { verifyCheckout, contactMatches, CHECKOUT_COOKIE } from "@/lib/checkout-token";

/**
 * POST /api/razorpay/create-order
 * Body: { orderId: string }  — orderId is our DB _id
 *
 * Amount is loaded from the DB (never trusted from the client). When OTP is
 * enabled the caller must present a verified checkout token whose contact
 * matches the order — this binds the payment session to its owner so a
 * guessed/enumerated orderId cannot be driven by a third party.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId: string | undefined = body?.orderId;
    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return NextResponse.json({ error: "Valid orderId required" }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (otpEnabled()) {
      const token = await verifyCheckout(cookies().get(CHECKOUT_COOKIE)?.value);
      if (!contactMatches(token, order.address)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    if (order.paymentStatus === "paid") {
      return NextResponse.json({ error: "Order already paid" }, { status: 400 });
    }

    const paise = Math.round(order.total * 100);
    if (!Number.isFinite(paise) || paise < 100) {
      return NextResponse.json({ error: "Minimum order amount is ₹1" }, { status: 400 });
    }

    const rp = getRazorpay();
    const rpOrder = await rp.orders.create({
      amount: paise,
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
    console.error("[razorpay/create-order]", e?.error?.description || e?.message);
    const status = e?.statusCode === 401 ? 401 : 500;
    return NextResponse.json({ error: "Could not start payment. Please try again." }, { status });
  }
}
