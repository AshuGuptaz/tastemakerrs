import mongoose, { Schema, Model } from "mongoose";

export interface ICustomOrder {
  flavor: string;
  weight: string;
  shape: string;
  eggless: boolean;
  message?: string;
  date: string;
  image?: string; // data URL or upload URL
  contact: { name: string; phone: string; email?: string };
  price: number;
  status: "new" | "quoted" | "confirmed" | "rejected";
  createdAt: Date;
}

const CustomOrderSchema = new Schema<ICustomOrder>(
  {
    flavor: String,
    weight: String,
    shape: String,
    eggless: Boolean,
    message: String,
    date: String,
    image: String,
    contact: {
      name: String,
      phone: String,
      email: String,
    },
    price: Number,
    status: { type: String, enum: ["new", "quoted", "confirmed", "rejected"], default: "new" },
  },
  { timestamps: true }
);

export const CustomOrder: Model<ICustomOrder> =
  (mongoose.models.CustomOrder as Model<ICustomOrder>) ||
  mongoose.model<ICustomOrder>("CustomOrder", CustomOrderSchema);
