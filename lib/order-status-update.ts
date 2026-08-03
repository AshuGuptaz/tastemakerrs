import { connectDB } from "@/lib/mongodb";
import { Order, type OrderStatus } from "@/models/Order";
import { STATUS_META } from "@/lib/order-status";
import {
  emailConfigured,
  smsConfigured,
  sendEmail,
  sendSMS,
  orderStatusEmailTemplate,
  orderStatusSmsTemplate,
} from "@/lib/notify";
import { logError } from "@/lib/logger";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thetastemakerrs.com";

// Customer-facing transitions worth a notification. "paid" is already covered
// by the order confirmation, and "pending" isn't meaningful to notify about.
const NOTIFY_ON: OrderStatus[] = ["in_kitchen", "out_for_delivery", "delivered", "cancelled", "refunded"];

/**
 * Move an order to a new status: records the transition on statusHistory and,
 * for customer-facing transitions, sends an email/SMS with a tracking link.
 * Notifications are best-effort and never fail the status change.
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ ok: boolean; error?: string }> {
  await connectDB();
  const order = await Order.findById(orderId);
  if (!order) return { ok: false, error: "Order not found" };
  if (order.status === status) return { ok: true }; // idempotent no-op

  order.status = status;
  order.statusHistory = [...(order.statusHistory ?? []), { status, at: new Date() }];
  await order.save();

  if (NOTIFY_ON.includes(status)) {
    try {
      const meta = STATUS_META[status];
      const a = order.address || {};
      const trackUrl = `${SITE_URL}/track/${orderId}`;
      await Promise.all([
        emailConfigured() && a.email
          ? sendEmail({
              to: a.email,
              subject: `${meta.emoji} ${meta.label} — order #${orderId.slice(-8).toUpperCase()}`,
              html: orderStatusEmailTemplate({ id: orderId, name: a.name || "there", label: meta.label, blurb: meta.blurb, emoji: meta.emoji, trackUrl }),
            })
          : Promise.resolve(null),
        smsConfigured() && a.phone
          ? sendSMS({ to: a.phone, body: orderStatusSmsTemplate({ id: orderId, emoji: meta.emoji, label: meta.label, trackUrl }) })
          : Promise.resolve(null),
      ]);
    } catch (e) {
      logError("order-status-update:notify", e, { orderId, status });
    }
  }

  return { ok: true };
}
