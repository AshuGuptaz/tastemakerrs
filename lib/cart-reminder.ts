import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Abandoned-cart reminder rules — pure functions so they're unit-tested and the
 * cron stays a thin wrapper. Policy (deliberately conservative):
 *   - a cart is "abandoned" once it's been untouched for MIN_AGE_H hours;
 *   - we give up after MAX_AGE_H hours (a 3-day-old nudge is just noise);
 *   - at most ONE reminder per cart state, and never more than one per
 *     MIN_GAP_DAYS per customer even if they keep editing the cart;
 *   - never if they've paid for an order since, or have unsubscribed.
 */
export const MIN_AGE_H = 3;
export const MAX_AGE_H = 48;
export const MIN_GAP_DAYS = 7;

export type CartLine = { productId: string; qty: number; variant?: string | null };

/** Order-independent fingerprint of cart contents. Equal carts → equal sig. */
export function cartSignature(items: CartLine[]): string {
  return items
    .map((i) => `${i.productId}|${i.variant ?? ""}|${i.qty}`)
    .sort()
    .join(";");
}

export type DueInput = {
  itemCount: number;
  cartUpdatedAt: Date;
  remindedAt: Date | null;
  optedOut: boolean;
};

export function isCartDue(c: DueInput, now: Date, paidSince: boolean): boolean {
  if (c.optedOut || paidSince || c.itemCount <= 0) return false;
  const ageH = (now.getTime() - c.cartUpdatedAt.getTime()) / 3_600_000;
  if (ageH < MIN_AGE_H || ageH > MAX_AGE_H) return false;
  if (c.remindedAt) {
    if (c.remindedAt >= c.cartUpdatedAt) return false; // already reminded for this cart state
    const gapDays = (now.getTime() - c.remindedAt.getTime()) / 86_400_000;
    if (gapDays < MIN_GAP_DAYS) return false; // cart changed, but we nudged recently
  }
  return true;
}

/* ── one-click unsubscribe token (HMAC of the customer id) ─────────────── */
// Same policy as lib/customer-auth: required in production, fixed dev fallback otherwise.
const secret = () => {
  const s = process.env.OTP_JWT_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("OTP_JWT_SECRET must be set in production");
  return s || "dev-only-otp-secret-change-me";
};

export function signUnsub(customerId: string): string {
  return createHmac("sha256", secret()).update(`cart-unsub:${customerId}`).digest("hex");
}

export function verifyUnsub(customerId: string, token: string): boolean {
  try {
    const a = Buffer.from(signUnsub(customerId), "hex");
    const b = Buffer.from(token, "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
