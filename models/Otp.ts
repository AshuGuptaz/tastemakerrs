import mongoose, { Schema, Model } from "mongoose";

export interface IOtp {
  email: string;
  phone: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  sends: number;
  consumed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    codeHash: { type: String, required: true },
    // TTL: Mongo removes the doc automatically once expiresAt passes.
    expiresAt: { type: Date, required: true, expires: 0 },
    attempts: { type: Number, default: 0 },
    sends: { type: Number, default: 1 },
    consumed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Otp =
  (mongoose.models.Otp as Model<IOtp>) ||
  (mongoose.model<IOtp>("Otp", OtpSchema) as unknown as Model<IOtp>);
