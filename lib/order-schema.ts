import { z } from "zod";

// Shape of a custom-cake spec. Unknown keys are stripped and every field is
// size-capped so an order can't be used to stuff arbitrary data into Mongo.
// image mirrors the cap in /api/custom-orders (data URL, ~1.4MB raw).
export const CustomSchema = z.object({
  base: z.string().max(100).nullable().optional(),
  flavor: z.string().max(100).optional(),
  weight: z.string().max(50).optional(),
  shape: z.string().max(50).optional(),
  eggless: z.boolean().optional(),
  message: z.string().max(500).optional(),
  date: z.string().max(50).optional(),
  image: z.string().max(2_000_000).optional(),
  price: z.number().optional(),
  contact: z
    .object({
      name: z.string().max(100).optional(),
      phone: z.string().max(20).optional(),
      email: z.string().max(200).optional(),
    })
    .optional(),
});

export const ItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string().max(200),
  price: z.number().positive(),
  qty: z.number().int().min(1).max(50),
  variant: z.string().max(100).optional(),
  custom: CustomSchema.optional(),
});

export const AddressSchema = z.object({
  name: z.string().min(1),
  // Stored lowercase: customer sessions carry a lowercased email, so exact
  // matching (account history) would miss "John@Gmail.com" otherwise.
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(4),
  notes: z.string().optional().default(""),
});

export const MAX_ITEMS = 30;
export const MAX_TOTAL_IMAGE_CHARS = 6_000_000;

// Capped: each custom item may carry a ~2MB image, so an unbounded array could
// blow Mongo's 16MB document limit (and server memory).
export const ItemsSchema = z
  .array(ItemSchema)
  .min(1)
  .max(MAX_ITEMS)
  .refine((items) => items.reduce((n, i) => n + (i.custom?.image?.length ?? 0), 0) <= MAX_TOTAL_IMAGE_CHARS, {
    message: "Too much image data in one order",
  });
