import { getBySlug } from "@/lib/products";
import { couponValue } from "@/lib/coupons";

/**
 * Server-side price authority for orders. The custom-cake and catalog pricing
 * maps below are IDENTICAL to those in app/custom-cake/page.tsx so the server
 * can independently recompute every line price and refuse client-supplied money.
 */

export const CUSTOM_FLAVORS = [
  { id: "vanilla", label: "Classic Vanilla", price: 0 },
  { id: "chocolate", label: "Rich Chocolate", price: 50 },
  { id: "red-velvet", label: "Red Velvet", price: 100 },
  { id: "rasmalai", label: "Rasmalai Fusion", price: 150 },
  { id: "pistachio", label: "Luxury Pistachio", price: 250 },
];

export const CUSTOM_WEIGHTS = [
  { id: "500g", label: "500 g", multiplier: 1 },
  { id: "1kg", label: "1 kg", multiplier: 1.8 },
  { id: "1.5kg", label: "1.5 kg", multiplier: 2.6 },
  { id: "2kg", label: "2 kg", multiplier: 3.4 },
];

export const CUSTOM_SHAPES = [
  { id: "round", label: "Round", price: 0 },
  { id: "square", label: "Square", price: 50 },
  { id: "heart", label: "Heart", price: 100 },
  { id: "tier", label: "Two-Tier", price: 400 },
];

export type CustomCakeSpec = {
  base?: string;
  flavor: string;
  weight: string;
  shape: string;
  eggless?: boolean;
  jain?: boolean;
  image?: string | null;
};

/**
 * Recompute a custom cake price from its spec. Mirrors the client formula in
 * app/custom-cake/page.tsx exactly.
 */
export function customCakePrice(c: CustomCakeSpec): number {
  const basePrice = (c.base ? getBySlug(c.base)?.price : undefined) ?? 600;
  const flavorAdd = CUSTOM_FLAVORS.find((f) => f.id === c.flavor)?.price || 0;
  const shapeAdd = CUSTOM_SHAPES.find((s) => s.id === c.shape)?.price || 0;
  const mult = CUSTOM_WEIGHTS.find((w) => w.id === c.weight)?.multiplier || 1;
  const customAdd = (c.jain ? 100 : 0) + (c.eggless ? 30 : 0) + (c.image ? 150 : 0);
  return Math.round((basePrice + flavorAdd + shapeAdd) * mult + customAdd);
}

export const DELIVERY = (subtotal: number): number =>
  subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 79;

type IncomingItem = {
  productId?: string;
  slug?: string;
  name?: string;
  price?: number;
  qty?: number;
  custom?: any;
};

export type NormalizedItem = {
  productId?: string;
  name: string;
  price: number;
  qty: number;
  custom?: any;
};

export type RecomputedOrder = {
  items: NormalizedItem[];
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
};

/**
 * Recompute an entire order with server-side price authority. Throws on any
 * item that cannot be resolved to a custom spec or a catalog product, or whose
 * quantity is not a positive integer.
 */
export function recomputeOrder(
  items: IncomingItem[],
  coupon: string | null | undefined
): RecomputedOrder {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Order must contain at least one item");
  }

  const normalized: NormalizedItem[] = items.map((item) => {
    const qty = item.qty;
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1) {
      throw new Error("Invalid item quantity");
    }

    if (item.custom && typeof item.custom === "object") {
      const price = customCakePrice(item.custom as CustomCakeSpec);
      return {
        productId: item.productId,
        name: item.name || "Custom Cake",
        price,
        qty,
        custom: item.custom,
      };
    }

    const product = getBySlug(item.productId || "") || getBySlug(item.slug || "");
    if (!product) {
      throw new Error("Unknown product in order");
    }
    return {
      productId: product.slug,
      name: product.name,
      price: product.price,
      qty,
    };
  });

  const subtotal = normalized.reduce((sum, it) => sum + it.price * it.qty, 0);
  const delivery = DELIVERY(subtotal);
  const discount = Math.min(couponValue(coupon, subtotal), subtotal);
  const total = Math.max(0, subtotal + delivery - discount);

  return { items: normalized, subtotal, delivery, discount, total };
}
