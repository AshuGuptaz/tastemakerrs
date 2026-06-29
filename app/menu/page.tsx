"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PRODUCTS, CATEGORY_META } from "@/lib/products";
import type { Category } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import Filters from "@/components/Filters";
import PageHeader from "@/components/ui/PageHeader";

function MenuContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const cat = (sp.get("cat") || "all") as Category | "all";
  const flavor = sp.get("flavor") || "";
  const bestseller = sp.get("bs") === "1";
  const max = Number(sp.get("max") || 2500);
  const sort = sp.get("sort") || "featured";

  const update = (key: string, val: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (!val || val === "featured") next.delete(key);
    else next.set(key, val);
    router.replace(`/menu?${next.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (flavor && !p.flavors.includes(flavor)) return false;
      if (bestseller && !p.bestseller) return false;
      if (p.price > max) return false;
      return true;
    });
  }, [cat, flavor, bestseller, max]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [filtered, sort]);

  return (
    <>
      {/* Header */}
      <PageHeader
        eyebrow="The menu"
        title={<>Cakes &amp; treats for <span className="text-gradient">every craving</span>.</>}
        subtitle="Filter by category, flavour or price. Eggless options for every cake — just ask."
      />
      <section className="section bg-transparent">
        <div className="container-x grid gap-8 md:grid-cols-[280px_1fr]">
          <Filters cat={cat} flavor={flavor} bestseller={bestseller} max={max} />

          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-ink-mut">
                <span className="font-semibold text-ink">{filtered.length}</span> {filtered.length === 1 ? "treat" : "treats"}
                {cat !== "all" && <> in {CATEGORY_META[cat as Category].label}</>}
              </p>
              <label className="sr-only" htmlFor="menu-sort">Sort treats</label>
              <select
                id="menu-sort"
                value={sort}
                onChange={(e) => update("sort", e.target.value)}
                className="rounded-pill border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink shadow-e1 focus:outline-none focus:ring-2 focus:ring-flame/30"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>
            {sorted.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="t-h3">No treats found</p>
                <p className="mt-2 text-ink-mut">Nothing matches those filters yet.</p>
                <Link href="/menu" className="btn-line mt-5">Clear all filters</Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                {sorted.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <>
          <section className="bg-surface py-16 md:py-24">
            <div className="container-x">
              <div className="skeleton h-16 w-2/3 max-w-md rounded-xl" />
              <div className="skeleton mt-5 h-4 w-1/2 max-w-sm rounded-md" />
            </div>
          </section>
          <section className="section bg-transparent">
            <div className="container-x grid gap-8 md:grid-cols-[280px_1fr]">
              <div className="skeleton hidden h-96 rounded-xl2 md:block" />
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </section>
        </>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
