import { PRODUCTS } from "@/lib/products";
import { FREE_DELIVERY_ABOVE } from "@/lib/pricing";
import type { Product } from "@/types/product";

/** Small, impulse-friendly categories. Cakes/hampers are the main purchase, not add-ons. */
const ADD_ON_CATEGORIES: ReadonlyArray<Product["category"]> = ["cookies", "muffins", "chocolates", "jars"];

/**
 * Catalog add-ons to suggest next to the cart. Pure + display-only: items are
 * real catalog products, so /api/orders reprices them like any other line.
 *
 * - Excludes anything already in the cart.
 * - Under the free-delivery threshold: add-ons that CROSS it come first
 *   (cheapest crossing first — least extra spend), then the rest by price desc.
 * - Otherwise: bestsellers first, then cheapest.
 * - One per category before repeating, so the strip isn't three muffins.
 */
export function suggestAddOns(cartProductIds: readonly string[], subtotal: number, limit = 3): Product[] {
  if (subtotal <= 0) return [];
  const inCart = new Set(cartProductIds);
  const pool = PRODUCTS.filter((p) => ADD_ON_CATEGORIES.includes(p.category) && !inCart.has(p.id));

  const gap = FREE_DELIVERY_ABOVE - subtotal;
  const ranked = [...pool].sort((a, b) => {
    if (gap > 0) {
      const ac = a.price >= gap, bc = b.price >= gap;
      if (ac !== bc) return ac ? -1 : 1;
      return ac ? a.price - b.price : b.price - a.price;
    }
    if (!!a.bestseller !== !!b.bestseller) return a.bestseller ? -1 : 1;
    return a.price - b.price;
  });

  const picked: Product[] = [];
  const seen = new Set<Product["category"]>();
  for (const p of ranked) {
    if (picked.length >= limit) break;
    if (!seen.has(p.category)) { seen.add(p.category); picked.push(p); }
  }
  for (const p of ranked) {
    if (picked.length >= limit) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked;
}
