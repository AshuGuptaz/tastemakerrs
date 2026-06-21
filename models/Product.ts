import mongoose, { Schema, Model } from "mongoose";

export interface IProduct {
  slug: string;
  name: string;
  category: string;
  price: number;
  unit?: string;
  description: string;
  flavors: string[];
  bestseller?: boolean;
  eggless?: boolean;
  jainFriendly?: boolean;
  customizable?: boolean;
  image: string;
  bg: string;
  active: boolean;
  stock?: number;
  trackInventory?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    unit: String,
    description: { type: String, required: true },
    flavors: { type: [String], default: [] },
    bestseller: { type: Boolean, default: false },
    eggless: { type: Boolean, default: true },
    jainFriendly: { type: Boolean, default: false },
    customizable: { type: Boolean, default: false },
    image: { type: String, default: "🎂" },
    bg: { type: String, default: "bg-cream-100" },
    active: { type: Boolean, default: true },
    stock: { type: Number, default: null },
    trackInventory: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>("Product", ProductSchema);
