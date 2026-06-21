import mongoose, { Schema, Model } from "mongoose";

export interface ICustomOrder {
  flavor: string;
  weight: string;
  shape: string;
  eggless: boolean;
  jain: boolean;
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
    flavor: { type: String, required: true },
    weight: { type: String, required: true },
    shape: String,
    eggless: { type: Boolean, default: false },
    jain: { type: Boolean, default: false },
    message: String,
    date: { type: String, required: true },
    image: { type: String, maxlength: 6000000 },
    contact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
    },
    price: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ["new", "quoted", "confirmed", "rejected"], default: "new" },
  },
  { timestamps: true }
);

export const CustomOrder: Model<ICustomOrder> =
  (mongoose.models.CustomOrder as Model<ICustomOrder>) ||
  mongoose.model<ICustomOrder>("CustomOrder", CustomOrderSchema);
