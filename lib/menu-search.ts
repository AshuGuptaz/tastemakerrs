import type { Product } from "@/types/product";
import { CATEGORY_META } from "@/lib/products";

/** Lowercase, strip punctuation, split to tokens. */
const tokens = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

/**
 * Every query word must appear (as a prefix of some word) in the product's
 * name / description / flavours / category — so "choc truffle" finds
 * "Truffle", and "eggless" finds products marked eggless. Empty query matches all.
 */
export function matchesQuery(p: Product, query: string): boolean {
  const q = tokens(query);
  if (q.length === 0) return true;
  const hay = tokens(
    [p.name, p.description, p.flavors.join(" "), CATEGORY_META[p.category]?.label ?? p.category, p.eggless ? "eggless egg free" : "", p.bestseller ? "bestseller" : ""].join(" ")
  );
  return q.every((w) => hay.some((h) => h.startsWith(w)));
}
