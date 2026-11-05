/**
 * Razorpay order bookkeeping — pure helpers, shared by create-order, verify and
 * the webhook.
 *
 * THE BUG THIS FIXES: every "Pay" tap used to create a NEW Razorpay order and
 * overwrite `razorpayOrderId`. If an earlier attempt then completed late (UPI
 * collect requests can settle minutes later), neither /verify nor the webhook
 * could match it to our order any more: Razorpay kept the money, our order
 * stayed "unpaid", and the customer was likely to pay again. Two defences:
 *   1. REUSE the existing Razorpay order on retry when it is still payable and
 *      the amount is unchanged (no stray second order is created at all);
 *   2. when a new one IS needed, remember every id (`razorpayOrderIds`) and
 *      match on ANY of them, so a late payment on an older attempt still lands.
 */

export type RpOrderLite = { id: string; status: string; amount: number };

export type RpDecision = "create" | "reuse" | "already_paid";

/**
 * What to do on a (re)try, given the Razorpay order we previously made (or null):
 *  - none / unknown / expired status        → create a fresh one
 *  - still payable ("created"/"attempted")  → reuse it, if the amount still matches
 *  - "paid"                                 → the money is already with Razorpay; don't create another
 */
export function decideRazorpayOrder(existing: RpOrderLite | null, amountPaise: number): RpDecision {
  if (!existing) return "create";
  if (existing.status === "paid") return "already_paid";
  if ((existing.status === "created" || existing.status === "attempted") && existing.amount === amountPaise) return "reuse";
  return "create";
}

/** Mongo filter matching an order by the current Razorpay order id OR any previous attempt's id. */
export const matchRazorpayOrderId = (rpOrderId: string) => ({
  $or: [{ razorpayOrderId: rpOrderId }, { razorpayOrderIds: rpOrderId }],
});

/** True if `rpOrderId` is the order's current id or one of its earlier attempts. */
export function hasRazorpayOrderId(
  order: { razorpayOrderId?: string | null; razorpayOrderIds?: string[] | null },
  rpOrderId: string
): boolean {
  return order.razorpayOrderId === rpOrderId || !!order.razorpayOrderIds?.includes(rpOrderId);
}
