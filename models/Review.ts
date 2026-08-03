import mongoose, { Schema, Model } from "mongoose";

/**
 * A product review. Verified-purchase only: the submit route (app/api/reviews)
 * requires a signed-in customer who has a PAID order containing the product, so
 * `customerId` + `orderId` are always real. Photos are stored inline as capped
 * data URLs (same approach as custom-cake reference images). Moderated:
 * defaults to "pending" and only "approved" reviews are shown publicly.
 */

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface IReview {
  _id: mongoose.Types.ObjectId;
  productId: string;
  customerId: string;
  orderId?: string;
  rating: number;
  title?: string;
  body: string;
  photos: string[];
  authorName: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema(
  {
    productId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    orderId: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 120 },
    body: { type: String, required: true, maxlength: 2000 },
    photos: { type: [String], default: [] },
    authorName: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  },
  { timestamps: true }
);

// One review per customer per product — a second submit updates the first
// (handled in the route), and this guards against races creating duplicates.
ReviewSchema.index({ productId: 1, customerId: 1 }, { unique: true });

export const Review =
  (mongoose.models.Review as Model<IReview>) ||
  (mongoose.model("Review", ReviewSchema) as unknown as Model<IReview>);
