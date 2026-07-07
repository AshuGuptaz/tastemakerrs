import mongoose, { Schema, Model } from "mongoose";

export interface IOtp {
  email: string;
  phone: string;
  codeHash: string;
  codeExpiresAt: Date;
  expiresAt: Date;
  attempts: number;
  consumed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    codeHash: { type: String, required: true },
    // When the CODE stops being usable (~10 min) — checked by /api/otp/verify.
    codeExpiresAt: { type: Date, required: true },
    // Row TTL (~1 h): Mongo removes the doc once this passes. Deliberately LONGER
    // than the code's validity so the row survives long enough for the send
    // endpoint's per-hour rate counting — a 10-min TTL made the hourly cap
    // impossible to enforce (rows vanished before the window closed).
    expiresAt: { type: Date, required: true, expires: 0 },
    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Otp =
  (mongoose.models.Otp as Model<IOtp>) ||
  (mongoose.model<IOtp>("Otp", OtpSchema) as unknown as Model<IOtp>);
