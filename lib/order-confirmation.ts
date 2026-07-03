import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import {
  emailConfigured,
  smsConfigured,
  sendEmail,
  sendSMS,
  orderEmailTemplate,
  orderSmsTemplate,
} from "@/lib/notify";

/**
 * Send the order confirmation email + SMS. Idempotent (guarded atomically by
 * `confirmationSentAt`) and best-effort — never throws into the payment flow.
 */
export async function sendOrderConfirmation(orderId: string) {
  try {
    await connectDB();

    // Atomic find-and-mark: only the first caller that finds confirmationSentAt
    // absent will get the document back and proceed. Concurrent webhook retries
    // see null and return immediately, preventing duplicate notifications.
    const order = await Order.findOneAndUpdate(
      { _id: orderId, confirmationSentAt: { $exists: false } },
      { $set: { confirmationSentAt: new Date() } },
      { new: true }
    );
    if (!order) return;

    const a = order.address || {};
    const payload = {
      id: order._id.toString(),
      name: a.name || "there",
      items: (order.items || []).map((i: any) => ({ name: i.name, qty: i.qty, price: i.price })),
      subtotal: order.subtotal,
      delivery: order.delivery,
      discount: order.discount,
      total: order.total,
      address: { street: a.street || "", city: a.city || "", state: a.state || "", pincode: a.pincode || "" },
    };

    await Promise.all([
      emailConfigured() && a.email
        ? sendEmail({ to: a.email, subject: "Your order is confirmed! 🎂", html: orderEmailTemplate(payload) })
        : Promise.resolve(null),
      smsConfigured() && a.phone
        ? sendSMS({ to: a.phone, body: orderSmsTemplate(order._id.toString(), order.total) })
        : Promise.resolve(null),
    ]);
  } catch (e: any) {
    console.error("[order-confirmation] failed:", e?.message);
  }
}
