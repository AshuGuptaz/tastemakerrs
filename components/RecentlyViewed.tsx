"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import Underlined from "@/components/Underlined";
import { getBySlug } from "@/lib/products";
import type { Product } from "@/types/product";
import { getRecentlyViewedIds } from "@/lib/recently-viewed";

export default function RecentlyViewed({ excludeId, limit = 4 }: { excludeId?: string; limit?: number }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const ids = getRecentlyViewedIds().filter((id) => id !== excludeId);
    const resolved = ids
      .map((id) => getBySlug(id))
      .filter((p): p is Product => Boolean(p))
      .slice(0, limit);
    setItems(resolved);
  }, [excludeId, limit]);

  if (items.length === 0) return null;

  return (
    <section className="section bg-transparent">
      <div className="container-x">
        <h2 className="t-h2">Recently <Underlined>viewed</Underlined></h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
