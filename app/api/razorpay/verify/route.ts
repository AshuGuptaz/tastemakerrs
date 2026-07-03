import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendOrderConfirmation } from "@/lib/order-confirmation";

/**
 * POST /api/razorpay/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
 *
 * Verifies the HMAC signature with constant-time comparison, cross-checks that
 * razorpay_order_id matches the order stored in DB (prevents id-swapping), then
 * marks the order as paid.
 */
export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return NextResponse.json({ ok: false, error: "Missing payment fields" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("[razorpay/verify] RAZORPAY_KEY_SECRET is not set");
      return NextResponse.json({ ok: false, error: "Payment verification unavailable" }, { status: 500 });
    }

    // Compute expected HMAC
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Constant-time comparison prevents timing oracle attacks
    const expectedBuf = Buffer.from(expected, "hex");
    let signatureBuf: Buffer;
    try {
      signatureBuf = Buffer.from(razorpay_signature, "hex");
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
    }
    if (
      expectedBuf.length !== signatureBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, signatureBuf)
    ) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 400 });
    }

    await connectDB();

    // Cross-check: the razorpay_order_id in the payload must match the one we
    // created for this DB order. Prevents an attacker from reusing a valid
    // signature from a different (possibly cheap) Razorpay order.
    const order = await Order.findById(orderId);
    if (!order || order.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      status: "paid",
      razorpayPaymentId: razorpay_payment_id,
    });

    await sendOrderConfirmation(orderId);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[razorpay/verify]", e?.message);
    return NextResponse.json({ ok: false, error: "Verification failed" }, { status: 500 });
  }
}
