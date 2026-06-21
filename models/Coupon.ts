import mongoose, { Schema, Model } from "mongoose";

export interface ICoupon {
  code: string;
  type: "percent" | "flat";
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
  startsAt?: Date;
  endsAt?: Date;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      set: (v: string) => (v || "").trim().toUpperCase(),
    },
    type: { type: String, enum: ["percent", "flat"], required: true },
    value: { type: Number, required: true },
    minSubtotal: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    startsAt: { type: Date },
    endsAt: { type: Date },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon: Model<ICoupon> =
  (mongoose.models.Coupon as Model<ICoupon>) || mongoose.model<ICoupon>("Coupon", CouponSchema);
