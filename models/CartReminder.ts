import mongoose, { Schema, Model } from "mongoose";

/**
 * Server-side snapshot of a SIGNED-IN customer's cart, used only to send one
 * "you left something in your cart" email (see /api/cron/cart-reminders).
 * Carts themselves live in the browser (localStorage); this is a best-effort
 * mirror written by <CartSync/>. Stores display fields only — prices are never
 * trusted from here (checkout reprices from the catalogue).
 */
const ItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    variant: String,
    image: String,
  },
  { _id: false }
);

export interface ICartReminder {
  customerId: string;
  items: { productId: string; name: string; price: number; qty: number; variant?: string; image?: string }[];
  sig: string; // fingerprint of the cart contents — only a real change bumps cartUpdatedAt
  cartUpdatedAt: Date;
  remindedAt: Date | null;
  optedOut: boolean; // one-click unsubscribe from the email
}

const CartReminderSchema = new Schema<ICartReminder>({
  customerId: { type: String, required: true, unique: true },
  items: { type: [ItemSchema], default: [] },
  sig: { type: String, default: "" },
  cartUpdatedAt: { type: Date, default: () => new Date() },
  remindedAt: { type: Date, default: null },
  optedOut: { type: Boolean, default: false },
});

// Auto-delete stale snapshots after 90 days (but never an opt-out marker, or we'd forget the unsubscribe).
CartReminderSchema.index({ cartUpdatedAt: 1 }, { expireAfterSeconds: 90 * 86400, partialFilterExpression: { optedOut: false } });

export const CartReminder: Model<ICartReminder> =
  (mongoose.models.CartReminder as Model<ICartReminder>) || mongoose.model<ICartReminder>("CartReminder", CartReminderSchema);
