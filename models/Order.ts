import mongoose, { Schema, Model } from "mongoose";

export type OrderStatus = "pending" | "paid" | "in_kitchen" | "out_for_delivery" | "delivered" | "cancelled" | "refunded";
export type PaymentMethod = "razorpay" | "stripe";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

const ItemSchema = new Schema(
  {
    productId: String,
    name: String,
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
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
  orderNumber?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  stripeSessionId?: string;
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
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    delivery: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    coupon: { type: String, default: null },
    orderNumber: { type: String },
    paymentMethod: { type: String, enum: ["razorpay", "stripe"], required: true },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "failed", "refunded"], default: "unpaid" },
    paymentIntentId: String,
    stripeSessionId: String,
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

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ razorpayOrderId: 1 }, { sparse: true });
OrderSchema.index({ paymentIntentId: 1 }, { sparse: true });
OrderSchema.index({ orderNumber: 1 }, { unique: true, sparse: true });

export const Order =
  (mongoose.models.Order as Model<IOrder>) ||
  (mongoose.model("Order", OrderSchema) as unknown as Model<IOrder>);
