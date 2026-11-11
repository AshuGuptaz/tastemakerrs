import mongoose, { Schema, Model } from "mongoose";

/**
 * A discount code. The pricing math (kind/value/minSubtotal/maxDiscount) is
 * evaluated by lib/pricing.ts; the rest here is eligibility (lib/coupon-rules.ts).
 * Never hard-deleted: deactivate with `active: false`, so past orders' `coupon`
 * codes always still resolve to a record. Usage is COUNTED from paid orders
 * (lib/coupons.ts), not stored here, so it can't drift from reality.
 */
export interface ICoupon {
  _id: mongoose.Types.ObjectId;
  code: string; // UPPERCASE, unique
  description?: string;
  kind: "percent" | "flat";
  value: number;
  minSubtotal?: number;
  maxDiscount?: number;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  usageLimit?: number | null; // total paid redemptions allowed
  firstOrderOnly: boolean; // contact must have no prior paid order
  oncePerContact: boolean; // contact must not have used this code before
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 32 },
    description: { type: String, maxlength: 200 },
    kind: { type: String, enum: ["percent", "flat"], required: true },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    usageLimit: { type: Number, min: 1, default: null },
    firstOrderOnly: { type: Boolean, default: false },
    oncePerContact: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon =
  (mongoose.models.Coupon as Model<ICoupon>) ||
  (mongoose.model("Coupon", CouponSchema) as unknown as Model<ICoupon>);
