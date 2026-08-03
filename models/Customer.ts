import mongoose, { Schema, Model } from "mongoose";

/**
 * Passwordless customer account. Identity is a verified contact channel
 * (phone and/or email) proven via the existing OTP flow — there is no password
 * to store, hash, reset, or leak. A Customer row is upserted on every OTP
 * verification (see app/api/otp/verify), keyed on whichever channel was proven.
 *
 * Holds the two things a returning customer wants one tap away: a saved address
 * book and their saved occasions (birthdays/anniversaries) that power the
 * reminder cron (lib/notify + app/api/cron/reminders).
 */

export type OccasionType = "birthday" | "anniversary" | "other";

const SavedAddressSchema = new Schema(
  {
    label: String, // "Home", "Office", …
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    notes: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const OccasionSchema = new Schema(
  {
    label: String, // "Mom's birthday"
    type: { type: String, enum: ["birthday", "anniversary", "other"], default: "birthday" },
    // Stored as month/day (1-based) so a yearly reminder is trivial and
    // timezone-free — we never need the year the person was born.
    month: { type: Number, min: 1, max: 12, required: true },
    day: { type: Number, min: 1, max: 31, required: true },
    recipientName: String,
    remind: { type: Boolean, default: true },
    // The year we last fired a reminder for this occasion — the cron uses it to
    // guarantee at-most-once-per-year delivery even if it runs multiple times.
    lastRemindedYear: { type: Number, default: null },
  },
  { _id: true }
);

export interface ISavedAddress {
  _id?: mongoose.Types.ObjectId;
  label?: string;
  name?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  notes?: string;
  isDefault?: boolean;
}

export interface IOccasion {
  _id?: mongoose.Types.ObjectId;
  label?: string;
  type?: OccasionType;
  month: number;
  day: number;
  recipientName?: string;
  remind?: boolean;
  lastRemindedYear?: number | null;
}

export interface ICustomer {
  _id: mongoose.Types.ObjectId;
  phone?: string;
  email?: string;
  contactEmail?: string;
  contactPhone?: string;
  name?: string;
  addresses: ISavedAddress[];
  occasions: IOccasion[];
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema(
  {
    // `phone` / `email` are the PROVEN identity — each is written only when
    // that exact channel was verified via OTP, and lookups key strictly on
    // them. Sparse + unique so a row with only one proven channel doesn't
    // collide on a null in the other, and no two accounts share a channel.
    phone: { type: String, index: { unique: true, sparse: true } },
    email: { type: String, index: { unique: true, sparse: true } },
    // Convenience contact info entered at OTP time but NOT proven — display &
    // notification use only. Deliberately un-indexed and never used for
    // identity lookup, so a contact value can't be used to hijack an account
    // keyed on someone else's proven channel.
    contactEmail: String,
    contactPhone: String,
    name: String,
    addresses: { type: [SavedAddressSchema], default: [] },
    occasions: { type: [OccasionSchema], default: [] },
  },
  { timestamps: true }
);

export const Customer =
  (mongoose.models.Customer as Model<ICustomer>) ||
  (mongoose.model("Customer", CustomerSchema) as unknown as Model<ICustomer>);
