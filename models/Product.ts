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
  customizable?: boolean;
  image: string;
  bg: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    unit: String,
    description: { type: String, required: true },
    flavors: { type: [String], default: [] },
    bestseller: { type: Boolean, default: false },
    eggless: { type: Boolean, default: true },
    customizable: { type: Boolean, default: false },
    image: { type: String, default: "🎂" },
    bg: { type: String, default: "bg-cream-100" },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>("Product", ProductSchema);
