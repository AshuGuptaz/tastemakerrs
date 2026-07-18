import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { logError } from "@/lib/logger";
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
  let claimed = false;
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
    claimed = true;

    const a = order.address || {};
    const payload = {
      id: order._id.toString(),
      name: a.name || "there",
      items: (order.items || []).map((i) => ({ name: i.name ?? "", qty: i.qty ?? 0, price: i.price ?? 0 })),
      subtotal: order.subtotal,
      delivery: order.delivery,
      discount: order.discount,
      total: order.total,
      address: { street: a.street || "", city: a.city || "", state: a.state || "", pincode: a.pincode || "" },
    };

    const [emailRes, smsRes] = await Promise.all([
      emailConfigured() && a.email
        ? sendEmail({ to: a.email, subject: "Your order is confirmed! 🎂", html: orderEmailTemplate(payload) })
        : Promise.resolve(null),
      smsConfigured() && a.phone
        ? sendSMS({ to: a.phone, body: orderSmsTemplate(order._id.toString(), order.total) })
        : Promise.resolve(null),
    ]);

    // sendEmail/sendSMS catch their own errors and resolve {ok:false} rather
    // than rejecting, so a bare try/catch here never actually saw a failed
    // delivery — confirmationSentAt was already committed above, silently
    // and permanently marking a confirmation "sent" when it never went out.
    const failed = (r: unknown) => !!r && typeof r === "object" && "ok" in r && (r as { ok: boolean }).ok === false;
    if (failed(emailRes) || failed(smsRes)) {
      // Un-claim so this stays retry-eligible instead of permanently lost.
      await Order.updateOne({ _id: orderId }, { $unset: { confirmationSentAt: "" } });
      logError("order-confirmation", new Error("delivery failed"), { orderId, emailRes, smsRes });
    }
  } catch (e) {
    if (claimed) {
      await Order.updateOne({ _id: orderId }, { $unset: { confirmationSentAt: "" } }).catch(() => {});
    }
    logError("order-confirmation", e, { orderId });
  }
}
