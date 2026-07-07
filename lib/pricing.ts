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

/** Rupee discount for a coupon code at a given subtotal. Unknown code → 0. */
export function couponValue(code: string, subtotal: number): number {
  const map: Record<string, number> = {
    FIRSTBITE: Math.round(subtotal * 0.1),
    BDAY150: subtotal >= 999 ? 150 : 0,
    HAMPER20: Math.round(subtotal * 0.2),
    BULK10: subtotal >= 3000 ? Math.round(subtotal * 0.1) : 0,
  };
  return map[code] || 0;
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
export function computeTotals(subtotal: number, rawCoupon?: string | null): Totals {
  const coupon = rawCoupon ? rawCoupon.trim().toUpperCase() : null;
  const delivery = deliveryFee(subtotal);
  const discount = coupon ? couponValue(coupon, subtotal) : 0;
  const total = Math.max(0, subtotal + delivery - discount);
  return { subtotal, delivery, discount, total, coupon: discount > 0 ? coupon : null };
}
