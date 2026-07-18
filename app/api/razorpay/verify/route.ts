import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { sendOrderConfirmation } from "@/lib/order-confirmation";
import { logError } from "@/lib/logger";

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
    if (!mongoose.isValidObjectId(orderId)) {
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      logError("razorpay/verify", new Error("RAZORPAY_KEY_SECRET is not set"));
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

    // Single atomic transition: cross-check that razorpay_order_id matches the
    // one we created for this DB order (prevents reusing a valid signature from
    // a different/cheaper Razorpay order) AND that the order hasn't already been
    // paid. The `paymentStatus: { $ne: "paid" }` guard makes this idempotent —
    // the signature triple is client-visible and long-lived, so without it a
    // replayed verify payload could revert a refunded/fulfilled order to "paid".
    const updated = await Order.findOneAndUpdate(
      { _id: orderId, razorpayOrderId: razorpay_order_id, paymentStatus: { $ne: "paid" } },
      { paymentStatus: "paid", status: "paid", razorpayPaymentId: razorpay_payment_id },
      { new: true }
    );

    if (!updated) {
      // Either the order/id didn't match, or it was already paid. Distinguish so
      // a genuine double-submit of an already-paid order still reports success
      // (the client polls this), while a mismatch is rejected.
      const existing = await Order.findById(orderId);
      if (existing && existing.razorpayOrderId === razorpay_order_id && existing.paymentStatus === "paid") {
        return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
    }

    await sendOrderConfirmation(orderId);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    logError("razorpay/verify", e);
    return NextResponse.json({ ok: false, error: "Verification failed" }, { status: 500 });
  }
}
