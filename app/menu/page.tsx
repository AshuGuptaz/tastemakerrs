"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { Search, X, MessageCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PRODUCTS, CATEGORY_META } from "@/lib/products";
import type { Category } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import Filters from "@/components/Filters";
import PageHeader from "@/components/ui/PageHeader";
import { matchesQuery } from "@/lib/menu-search";
import { whatsappLink } from "@/lib/site";

function MenuContent() {
  const sp = useSearchParams();
  const router = useRouter();
  // Guard against malformed URL params: an unknown ?cat= must not index into
  // CATEGORY_META (would throw & white-screen), and a non-numeric ?max= must not
  // become NaN (would filter out every product with no explanation).
  const rawCat = sp.get("cat") || "all";
  const cat = (rawCat === "all" || rawCat in CATEGORY_META ? rawCat : "all") as Category | "all";
  const flavor = sp.get("flavor") || "";
  const bestseller = sp.get("bs") === "1";
  const parsedMax = Number(sp.get("max"));
  const max = Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : 2500;
  const sort = sp.get("sort") || "featured";
  const q = (sp.get("q") || "").slice(0, 60);

  // Typing stays instant (local state); the URL commit is debounced.
  const [qInput, setQInput] = useState(q);
  const qTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => setQInput(q), [q]); // back/forward, Reset
  useEffect(() => () => clearTimeout(qTimer.current), []);
  const onSearch = (v: string) => {
    setQInput(v);
    clearTimeout(qTimer.current);
    qTimer.current = setTimeout(() => update("q", v.trim() || null), 200);
  };

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
      if (!matchesQuery(p, q)) return false;
      return true;
    });
  }, [cat, flavor, bestseller, max, q]);

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
        titleSegments={[
          { text: "Cakes & treats for" },
          { text: "every craving.", className: "text-gradient" },
        ]}
        subtitle="Filter by category, flavour or price. Eggless options for every cake — just ask."
        scrollFx
      />
      <section className="section bg-transparent">
        <div className="container-x">
          <div className="relative mb-6 max-w-xl">
            <label htmlFor="menu-search" className="sr-only">Search the menu</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-mut/70" />
            <input
              id="menu-search"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={qInput}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search cakes, flavours, “eggless”…"
              className="input !rounded-pill !pl-11 !pr-11 shadow-e1 [&::-webkit-search-cancel-button]:hidden"
            />
            {qInput && (
              <button
                type="button"
                onClick={() => onSearch("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-pill text-ink-mut hover:bg-ink/[0.05] hover:text-ink focus-ring"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="container-x grid items-start gap-8 md:grid-cols-[280px_1fr]">
          <Filters cat={cat} flavor={flavor} bestseller={bestseller} max={max} />

          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-ink-mut">
                <AnimatePresence mode="wait">
                  <m.span
                    key={filtered.length}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.22 }}
                    className="inline-block font-semibold text-ink"
                  >
                    {filtered.length}
                  </m.span>
                </AnimatePresence>{" "}
                {filtered.length === 1 ? "treat" : "treats"}
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
                <p className="mt-2 text-ink-mut">
                  {q ? <>Nothing matches “{q}” with those filters.</> : "Nothing matches those filters yet."}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/menu" className="btn-line">Clear all filters</Link>
                  <a
                    href={whatsappLink(q ? `Hi, do you make “${q}”? I couldn't find it on the menu.` : "Hi, I couldn't find what I'm looking for on the menu.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-accent"
                  >
                    <MessageCircle className="h-4 w-4" /> Can&apos;t find it? Ask us
                  </a>
                </div>
              </div>
            ) : (
              <m.div layout className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {sorted.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </AnimatePresence>
              </m.div>
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
