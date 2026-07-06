import { z } from "zod";

/**
 * Whitelist of writable product fields for the admin create/update APIs.
 * Prevents arbitrary/unexpected keys and guarantees price is a non-negative
 * number before it can flow into order totals. Mirrors models/Product.ts.
 */
export const ProductInput = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(50),
  price: z.number().nonnegative(),
  unit: z.string().max(50).optional(),
  description: z.string().max(2000),
  flavors: z.array(z.string().max(50)).max(50).optional(),
  bestseller: z.boolean().optional(),
  eggless: z.boolean().optional(),
  customizable: z.boolean().optional(),
  image: z.string().max(2000).optional(),
  bg: z.string().max(50).optional(),
  active: z.boolean().optional(),
});
