"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PRODUCTS, CATEGORY_META } from "@/lib/products";
import type { Category } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import Filters from "@/components/Filters";
import Underlined from "@/components/Underlined";

function MenuContent() {
  const sp = useSearchParams();
  const cat = (sp.get("cat") || "all") as Category | "all";
  const flavor = sp.get("flavor") || "";
  const bestseller = sp.get("bs") === "1";
  const max = Number(sp.get("max") || 2500);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (flavor && !p.flavors.includes(flavor)) return false;
      if (bestseller && !p.bestseller) return false;
      if (p.price > max) return false;
      return true;
    });
  }, [cat, flavor, bestseller, max]);

  return (
    <>
      {/* Header */}
      <section className="bg-peach-100 py-16 md:py-24">
        <div className="container-x">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="display text-[clamp(2.5rem,8vw,6rem)]">
            THE <Underlined>MENU</Underlined>.
          </motion.h1>
          <p className="mt-4 max-w-xl text-cocoa/70">
            Filter by category, flavor or price. Eggless options for every cake — just ask.
          </p>
          {cat !== "all" && (
            <p className="mt-2 inline-block rounded-pill bg-white px-3 py-1 text-sm font-semibold">
              Showing: {CATEGORY_META[cat as Category].label} · {filtered.length} items
            </p>
          )}
        </div>
      </section>

      <section className="section bg-cream-50">
        <div className="container-x grid gap-8 md:grid-cols-[280px_1fr]">
          <Filters cat={cat} flavor={flavor} bestseller={bestseller} max={max} />

          <div>
            {filtered.length === 0 ? (
              <div className="card p-10 text-center">
                <p className="font-display text-2xl">NO TREATS FOUND</p>
                <p className="mt-2 text-cocoa/60">Try clearing some filters.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p, i) => (
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
          <section className="bg-peach-100 py-16 md:py-24">
            <div className="container-x">
              <div className="skeleton h-16 w-2/3 max-w-md rounded-xl" />
              <div className="skeleton mt-5 h-4 w-1/2 max-w-sm rounded-md" />
            </div>
          </section>
          <section className="section bg-cream-50">
            <div className="container-x grid gap-8 md:grid-cols-[280px_1fr]">
              <div className="skeleton hidden h-96 rounded-xl2 md:block" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
