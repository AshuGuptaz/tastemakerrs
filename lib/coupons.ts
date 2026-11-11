/**
 * Server-side coupon lookup + evaluation (DB-backed). Pure rules live in
 * lib/coupon-rules.ts; the math in lib/pricing.ts.
 */
import { connectDB } from "@/lib/mongodb";
import { Coupon } from "@/models/Coupon";
import { Order } from "@/models/Order";
import { logError } from "@/lib/logger";
import { BUILTIN_COUPONS, type CouponRule } from "@/lib/pricing";
import { checkCoupon, type CouponDoc } from "@/lib/coupon-rules";

/** Eligibility flags of the launch codes (previously hardcoded in /api/orders). */
const BUILTIN_FLAGS: Record<string, Partial<CouponDoc>> = {
  FIRSTBITE: { firstOrderOnly: true, description: "10% off your first order" },
  BDAY150: { oncePerContact: true, description: "₹150 off orders of ₹999+" },
  HAMPER20: { description: "20% off" },
  BULK10: { description: "10% off orders of ₹3000+" },
};

const builtinDocs = (): CouponDoc[] =>
  BUILTIN_COUPONS.map((r) => ({ ...r, active: true, ...(BUILTIN_FLAGS[r.code] || {}) }));

let seeded: Promise<void> | null = null;
/** Insert the launch codes once per process; `$setOnInsert` never overwrites an admin's edits. */
function ensureSeeded(): Promise<void> {
  if (!seeded) {
    seeded = (async () => {
      await connectDB();
      await Promise.all(
        builtinDocs().map((d) => Coupon.updateOne({ code: d.code }, { $setOnInsert: d }, { upsert: true }))
      );
    })().catch((e) => {
      seeded = null; // retry next request
      throw e;
    });
  }
  return seeded;
}

const PAID = { $in: ["paid", "refunded"] };
const CI = { locale: "en", strength: 2 } as const; // emails compare case-insensitively

export type Contact = { phone?: string; email?: string };

async function contactCounts(code: string, contact?: Contact) {
  const or: Record<string, string>[] = [];
  if (contact?.phone) or.push({ "address.phone": contact.phone });
  if (contact?.email?.trim()) or.push({ "address.email": contact.email.trim() });
  if (or.length === 0) return { contactPaidOrders: 0, contactUsesOfCode: 0 };
  const [any, same] = await Promise.all([
    Order.exists({ $or: or, paymentStatus: PAID }).collation(CI),
    Order.exists({ $or: or, paymentStatus: PAID, coupon: code }).collation(CI),
  ]);
  return { contactPaidOrders: any ? 1 : 0, contactUsesOfCode: same ? 1 : 0 };
}

export type CouponResult =
  | { ok: true; rule: CouponRule; discount: number; description?: string }
  | { ok: false; error: string };

/**
 * Is `rawCode` usable for this cart/contact right now? `rule` is what the client
 * may re-evaluate (it is just the pricing fields — never usage counters).
 */
export async function evaluateCoupon(rawCode: string, subtotal: number, contact?: Contact): Promise<CouponResult> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a coupon code." };

  let doc: CouponDoc | null = null;
  try {
    await ensureSeeded();
    const found = await Coupon.findOne({ code }).lean();
    doc = found
      ? {
          code: found.code, kind: found.kind, value: found.value,
          minSubtotal: found.minSubtotal ?? undefined, maxDiscount: found.maxDiscount ?? undefined,
          description: found.description, active: found.active,
          startsAt: found.startsAt, expiresAt: found.expiresAt, usageLimit: found.usageLimit,
          firstOrderOnly: found.firstOrderOnly, oncePerContact: found.oncePerContact,
        }
      : null;
  } catch (e) {
    // DB down: fall back to the launch codes rather than blocking every discounted order.
    logError("coupons/lookup", e, { code });
    doc = builtinDocs().find((d) => d.code === code) ?? null;
  }
  if (!doc) return { ok: false, error: "That coupon code isn't valid." };

  let timesUsedTotal = 0;
  let counts = { contactPaidOrders: 0, contactUsesOfCode: 0 };
  try {
    if (doc.usageLimit != null) timesUsedTotal = await Order.countDocuments({ coupon: code, paymentStatus: PAID });
    counts = await contactCounts(code, contact);
  } catch (e) {
    logError("coupons/usage", e, { code });
  }

  const verdict = checkCoupon(doc, { now: new Date(), subtotal, timesUsedTotal, ...counts });
  if (!verdict.ok) return { ok: false, error: verdict.reason };
  const rule: CouponRule = {
    code: doc.code, kind: doc.kind, value: doc.value,
    ...(doc.minSubtotal !== undefined ? { minSubtotal: doc.minSubtotal } : {}),
    ...(doc.maxDiscount !== undefined ? { maxDiscount: doc.maxDiscount } : {}),
  };
  return { ok: true, rule, discount: verdict.discount, description: doc.description };
}
