/**
 * Coupon ELIGIBILITY — pure (no DB, no React) so it's unit-tested and shared.
 * The discount AMOUNT is lib/pricing.ts (`discountForRule`); this answers only
 * "may this customer use this code right now?". The server (/api/orders) is the
 * authority; /api/coupons/validate uses the same function for instant feedback.
 */
import { discountForRule, type CouponRule } from "@/lib/pricing";
import { formatINR } from "@/lib/format";

export type CouponDoc = CouponRule & {
  description?: string;
  active: boolean;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  usageLimit?: number | null;
  firstOrderOnly?: boolean;
  oncePerContact?: boolean;
};

export type EligibilityCtx = {
  now: Date;
  subtotal: number;
  /** paid/refunded orders that already used this code (all customers) */
  timesUsedTotal: number;
  /** paid/refunded orders by this phone/email (any code); 0 when contact unknown */
  contactPaidOrders: number;
  /** paid/refunded orders by this phone/email that used THIS code; 0 when contact unknown */
  contactUsesOfCode: number;
};

export type Eligibility = { ok: true; discount: number } | { ok: false; reason: string };

export function checkCoupon(c: CouponDoc, ctx: EligibilityCtx): Eligibility {
  const bad = (reason: string): Eligibility => ({ ok: false, reason });
  if (!c.active) return bad(`${c.code} is not valid.`);
  if (c.startsAt && ctx.now < new Date(c.startsAt)) return bad(`${c.code} isn't active yet.`);
  if (c.expiresAt && ctx.now > new Date(c.expiresAt)) return bad(`${c.code} has expired.`);
  if (c.usageLimit != null && ctx.timesUsedTotal >= c.usageLimit) return bad(`${c.code} has been fully redeemed.`);
  if (c.minSubtotal !== undefined && c.minSubtotal !== null && ctx.subtotal < c.minSubtotal) {
    return bad(`${c.code} is valid on orders of ${formatINR(c.minSubtotal)} or more.`);
  }
  if (c.firstOrderOnly && ctx.contactPaidOrders > 0) return bad(`${c.code} is only valid on your first order.`);
  if (c.oncePerContact && ctx.contactUsesOfCode > 0) return bad(`${c.code} has already been used.`);
  const discount = discountForRule(c, ctx.subtotal);
  if (discount <= 0) return bad(`${c.code} doesn't apply to this cart.`);
  return { ok: true, discount };
}
