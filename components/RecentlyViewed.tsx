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
    <section className="section bg-transparent max-md:py-10">
      <div className="container-x">
        <h2 className="t-h2">Recently <Underlined>viewed</Underlined></h2>
        <div className="mt-6 no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 scroll-px-5 md:mx-0 md:grid md:gap-5 md:overflow-visible md:px-0 md:pb-0 md:mt-8 md:grid-cols-4">
          {items.map((p, i) => (
            <div key={p.id} className="w-[72vw] max-w-[18rem] shrink-0 snap-start md:w-auto md:max-w-none">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
