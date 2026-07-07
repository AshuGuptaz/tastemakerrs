import mongoose, { Schema, Model } from "mongoose";

/**
 * Shared fixed-window rate-limit counter. One doc per limit key (e.g.
 * "login:1.2.3.4"). Backed by MongoDB so the limit is enforced across all
 * serverless instances — an in-memory Map only limits a single lambda.
 */
export interface IRateLimit {
  _id: string; // the limit key
  count: number;
  resetAt: Date; // window end
  expiresAt: Date; // TTL cleanup (== resetAt)
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    _id: { type: String, required: true },
    count: { type: Number, default: 0 },
    resetAt: { type: Date, required: true },
    // TTL: Mongo drops stale buckets automatically once the window is over.
    expiresAt: { type: Date, required: true, expires: 0 },
  },
  { versionKey: false }
);

export const RateLimit =
  (mongoose.models.RateLimit as Model<IRateLimit>) ||
  (mongoose.model<IRateLimit>("RateLimit", RateLimitSchema) as unknown as Model<IRateLimit>);
