import { connectDB } from "@/lib/mongodb";
import { Coupon } from "@/models/Coupon";

/**
 * Server-side coupon valuation. Mirrors the client `couponValue` in
 * app/checkout/page.tsx exactly so server price authority matches the UI.
 */
export function couponValue(code: string | null | undefined, subtotal: number): number {
  const c = (code || "").trim().toUpperCase();
  const map: Record<string, number> = {
    FIRSTBITE: Math.round(subtotal * 0.10),
    BDAY150: subtotal >= 999 ? 150 : 0,
    HAMPER20: Math.round(subtotal * 0.20),
    BULK10: subtotal >= 3000 ? Math.round(subtotal * 0.10) : 0,
  };
  return map[c] || 0;
}

/**
 * Resolves a coupon discount against active DB Coupon docs, honoring the
 * date window, minSubtotal and usageLimit. Falls back to the static
 * `couponValue` when no DB coupon is found or on any error. Never throws.
 */
export async function resolveCoupon(
  code: string | null | undefined,
  subtotal: number
): Promise<number> {
  const c = (code || "").trim().toUpperCase();
  if (!c) return 0;
  try {
    await connectDB();
    const coupon = await Coupon.findOne({ code: c, active: true });
    if (coupon) {
      const now = new Date();
      const inWindow =
        (!coupon.startsAt || now >= coupon.startsAt) &&
        (!coupon.endsAt || now <= coupon.endsAt);
      const meetsMin = subtotal >= (coupon.minSubtotal || 0);
      const underLimit =
        coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit;
      if (inWindow && meetsMin && underLimit) {
        let discount =
          coupon.type === "percent"
            ? Math.round((subtotal * coupon.value) / 100)
            : coupon.value;
        if (coupon.maxDiscount != null) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
        return Math.min(discount, subtotal);
      }
    }
    return couponValue(c, subtotal);
  } catch {
    return couponValue(c, subtotal);
  }
}

/**
 * Increments usedCount on a coupon. No-op when no code; never throws.
 */
export async function incrementCouponUsage(
  code: string | null | undefined
): Promise<void> {
  const c = (code || "").trim().toUpperCase();
  if (!c) return;
  try {
    await connectDB();
    await Coupon.updateOne({ code: c }, { $inc: { usedCount: 1 } });
  } catch {
    /* no-op */
  }
}
