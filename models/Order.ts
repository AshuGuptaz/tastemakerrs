import mongoose, { Schema, Model } from "mongoose";

export type OrderStatus = "pending" | "paid" | "in_kitchen" | "out_for_delivery" | "delivered" | "cancelled" | "refunded";
export type PaymentMethod = "razorpay" | "stripe";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

const ItemSchema = new Schema(
  {
    productId: String,
    name: String,
    price: Number,
    qty: Number,
    custom: Schema.Types.Mixed,
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    name: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    notes: String,
  },
  { _id: false }
);

export interface IOrder {
  items: any[];
  address: any;
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  coupon?: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema(
  {
    items: { type: [ItemSchema], required: true },
    address: { type: AddressSchema, required: true },
    subtotal: Number,
    delivery: Number,
    discount: Number,
    total: { type: Number, required: true },
    coupon: { type: String, default: null },
    paymentMethod: { type: String, enum: ["razorpay", "stripe"], required: true },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "failed", "refunded"], default: "unpaid" },
    paymentIntentId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
      type: String,
      enum: ["pending", "paid", "in_kitchen", "out_for_delivery", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order =
  (mongoose.models.Order as Model<IOrder>) ||
  (mongoose.model("Order", OrderSchema) as unknown as Model<IOrder>);
