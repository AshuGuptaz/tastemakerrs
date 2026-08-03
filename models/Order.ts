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
    variant: String,
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

const GiftSchema = new Schema(
  {
    isGift: { type: Boolean, default: false },
    recipientName: String,
    recipientPhone: String,
    message: String,
    hidePrices: { type: Boolean, default: false },
  },
  { _id: false }
);

const FulfillmentSchema = new Schema(
  {
    date: String, // YYYY-MM-DD
    slot: String, // DELIVERY_SLOTS id
  },
  { _id: false }
);

export interface IOrderItem {
  productId?: string;
  name?: string;
  price?: number;
  qty?: number;
  variant?: string;
  custom?: unknown;
}

export interface IOrderAddress {
  name?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
}

export interface IOrderGift {
  isGift?: boolean;
  recipientName?: string;
  recipientPhone?: string;
  message?: string;
  hidePrices?: boolean;
}

export interface IOrderFulfillment {
  date?: string; // YYYY-MM-DD
  slot?: string; // DELIVERY_SLOTS id
}

export interface IOrder {
  customerId?: string;
  items: IOrderItem[];
  address: IOrderAddress;
  gift?: IOrderGift;
  fulfillment?: IOrderFulfillment;
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
  confirmationSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema(
  {
    // Set when the order is placed while signed in — links it to the customer
    // for order history / reorder. Guest orders (no session) leave this null.
    customerId: { type: String, index: true, default: null },
    items: { type: [ItemSchema], required: true },
    address: { type: AddressSchema, required: true },
    gift: { type: GiftSchema, default: undefined },
    fulfillment: { type: FulfillmentSchema, default: undefined },
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
    confirmationSentAt: Date,
  },
  { timestamps: true }
);

export const Order =
  (mongoose.models.Order as Model<IOrder>) ||
  (mongoose.model("Order", OrderSchema) as unknown as Model<IOrder>);
