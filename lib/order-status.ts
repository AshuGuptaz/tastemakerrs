import type { OrderStatus } from "@/models/Order";

/**
 * Customer-facing labels + copy for each order status. Shared by the account
 * order history, the live tracking page, and the status-change notifications
 * so the wording is identical everywhere.
 */
export const STATUS_META: Record<
  OrderStatus,
  { label: string; blurb: string; emoji: string }
> = {
  pending: { label: "Awaiting payment", blurb: "We're waiting for your payment to confirm.", emoji: "⏳" },
  paid: { label: "Order confirmed", blurb: "Payment received — we're preheating the oven!", emoji: "✅" },
  in_kitchen: { label: "In the kitchen", blurb: "Your cake is being freshly baked and hand-finished.", emoji: "👩‍🍳" },
  out_for_delivery: { label: "Out for delivery", blurb: "On its way to you — keep your phone handy!", emoji: "🛵" },
  delivered: { label: "Delivered", blurb: "Enjoy every bite. Thank you for ordering with us!", emoji: "🎂" },
  cancelled: { label: "Cancelled", blurb: "This order was cancelled.", emoji: "✖️" },
  refunded: { label: "Refunded", blurb: "This order was refunded.", emoji: "↩️" },
};

/** The happy-path timeline shown as a stepper on the tracking page. */
export const TRACK_STEPS: OrderStatus[] = ["paid", "in_kitchen", "out_for_delivery", "delivered"];

/** Position of a status within TRACK_STEPS, or -1 for non-timeline statuses. */
export function trackIndex(status: OrderStatus): number {
  return TRACK_STEPS.indexOf(status);
}

/** True for terminal off-happy-path statuses (rendered distinctly). */
export function isCancelledLike(status: OrderStatus): boolean {
  return status === "cancelled" || status === "refunded";
}
