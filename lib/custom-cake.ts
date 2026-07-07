import { getBySlug } from "@/lib/products";

/**
 * Custom-cake pricing — the SINGLE source of truth shared by the client studio
 * (app/custom-cake/page.tsx) and the server order authority (app/api/orders).
 *
 * Never trust a client-sent price for a custom cake: /api/orders recomputes it
 * from this formula using the `custom` spec in the cart item. Keeping the tables
 * and formula here (instead of duplicated in the page) guarantees the displayed
 * price and the charged price stay identical.
 */

export const CUSTOM_FLAVORS = [
  { id: "vanilla", label: "Classic Vanilla", price: 0 },
  { id: "chocolate", label: "Rich Chocolate", price: 50 },
  { id: "red-velvet", label: "Red Velvet", price: 100 },
  { id: "rasmalai", label: "Rasmalai Fusion", price: 150 },
  { id: "pistachio", label: "Luxury Pistachio", price: 250 },
] as const;

export const CUSTOM_WEIGHTS = [
  { id: "500g", label: "500 g", multiplier: 1 },
  { id: "1kg", label: "1 kg", multiplier: 1.8 },
  { id: "1.5kg", label: "1.5 kg", multiplier: 2.6 },
  { id: "2kg", label: "2 kg", multiplier: 3.4 },
] as const;

export const CUSTOM_SHAPES = [
  { id: "round", label: "Round", price: 0 },
  { id: "square", label: "Square", price: 50 },
  { id: "heart", label: "Heart", price: 100 },
  { id: "tier", label: "Two-Tier", price: 400 },
] as const;

export const DEFAULT_CUSTOM_BASE = 600;
export const EGGLESS_ADD = 30;
export const IMAGE_PRINT_ADD = 150;

export type CustomCakeSpec = {
  base?: string | null; // slug of the base product this cake was derived from
  flavor?: string;
  weight?: string;
  shape?: string;
  eggless?: boolean;
  hasImage?: boolean; // reference image for an edible print (+₹150)
};

/** Authoritative custom-cake price. Unknown ids fall back to safe defaults. */
export function priceCustomCake(spec: CustomCakeSpec): number {
  const baseProduct = spec.base ? getBySlug(spec.base) : undefined;
  const basePrice = baseProduct?.price ?? DEFAULT_CUSTOM_BASE;
  const flavorAdd = CUSTOM_FLAVORS.find((f) => f.id === spec.flavor)?.price ?? 0;
  const shapeAdd = CUSTOM_SHAPES.find((s) => s.id === spec.shape)?.price ?? 0;
  const mult = CUSTOM_WEIGHTS.find((w) => w.id === spec.weight)?.multiplier ?? 1;
  const customAdd = (spec.eggless ? EGGLESS_ADD : 0) + (spec.hasImage ? IMAGE_PRINT_ADD : 0);
  return Math.round((basePrice + flavorAdd + shapeAdd) * mult + customAdd);
}

/** Server-authoritative display name for a custom cake (client name is untrusted). */
export function customCakeName(spec: CustomCakeSpec): string {
  const flavor = CUSTOM_FLAVORS.find((f) => f.id === spec.flavor)?.label;
  if (!flavor) return "Custom cake";
  const weight = CUSTOM_WEIGHTS.find((w) => w.id === spec.weight)?.label;
  return `Custom ${flavor}${weight ? ` (${weight})` : ""}`;
}
