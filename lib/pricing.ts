/**
 * Cart pricing — the SINGLE source of truth for delivery, coupons and totals,
 * shared by the checkout UI (app/checkout/page.tsx) and the server order
 * authority (app/api/orders/route.ts).
 *
 * These rules used to be duplicated in both places, so a change in one and not
 * the other silently made the charged amount diverge from the displayed one.
 * Import from here on both sides — never re-implement the math.
 */

export const DELIVERY_FEE = 79;
export const FREE_DELIVERY_ABOVE = 999;

/**
 * A coupon's pricing rule — the ONLY thing the math needs. Eligibility (dates,
 * usage limits, first-order-only…) lives in lib/coupon-rules.ts; this stays pure
 * so the checkout UI and /api/orders compute the identical rupee amount.
 */
export type CouponRule = {
  code: string; // UPPERCASE
  kind: "percent" | "flat";
  value: number; // percent: 0–100, flat: rupees
  minSubtotal?: number; // discount is 0 below this subtotal
  maxDiscount?: number; // cap, in rupees (mainly for percent coupons)
};

/** The launch coupons. Seeded into the DB on first use (lib/coupons.ts), and the offline fallback. */
export const BUILTIN_COUPONS: readonly CouponRule[] = [
  { code: "FIRSTBITE", kind: "percent", value: 10 },
  { code: "BDAY150", kind: "flat", value: 150, minSubtotal: 999 },
  { code: "HAMPER20", kind: "percent", value: 20 },
  { code: "BULK10", kind: "percent", value: 10, minSubtotal: 3000 },
];

/** Rupee discount for one rule at a subtotal. Whole rupees, never more than the subtotal. */
export function discountForRule(rule: CouponRule, subtotal: number): number {
  if (!(subtotal > 0)) return 0;
  if (rule.minSubtotal !== undefined && subtotal < rule.minSubtotal) return 0;
  let d = rule.kind === "percent" ? Math.round((subtotal * rule.value) / 100) : Math.round(rule.value);
  if (rule.maxDiscount !== undefined) d = Math.min(d, Math.round(rule.maxDiscount));
  return Math.max(0, Math.min(d, subtotal));
}

/** Rupee discount for a coupon code at a given subtotal. Unknown code → 0. */
export function couponValue(code: string, subtotal: number, rules: readonly CouponRule[] = BUILTIN_COUPONS): number {
  const rule = rules.find((r) => r.code === code);
  return rule ? discountForRule(rule, subtotal) : 0;
}

/** Delivery fee — free above the threshold, flat fee otherwise. */
export function deliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
}

export type Totals = {
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  coupon: string | null; // normalized code actually applied (null if it earned nothing)
};

/** Authoritative totals for a subtotal + (optional) coupon. Coupon is normalized. */
export function computeTotals(
  subtotal: number,
  rawCoupon?: string | null,
  rules: readonly CouponRule[] = BUILTIN_COUPONS
): Totals {
  const coupon = rawCoupon ? rawCoupon.trim().toUpperCase() : null;
  const delivery = deliveryFee(subtotal);
  const discount = coupon ? couponValue(coupon, subtotal, rules) : 0;
  const total = Math.max(0, subtotal + delivery - discount);
  return { subtotal, delivery, discount, total, coupon: discount > 0 ? coupon : null };
}
