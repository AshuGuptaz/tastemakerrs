"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { getBySlug } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import PageHeader from "@/components/ui/PageHeader";

export default function WishlistPage() {
  const { ids, hydrated } = useWishlist();
  // Ids survive even if a product is later pulled from the catalog — drop
  // anything that no longer resolves instead of rendering a broken card.
  const items = ids.map((id) => getBySlug(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <section className="bg-transparent py-4 md:py-6">
      <PageHeader
        eyebrow="Saved for later"
        title="Your wishlist."
        subtitle="Everything you've hearted, in one place — ready whenever you are."
      />

      <div className="container-x py-10 md:py-14">
        {!hydrated ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="card grid place-items-center p-16 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-surface text-flame"><Heart className="h-9 w-9" /></div>
            <p className="mt-4 t-h3">Nothing saved yet</p>
            <p className="mt-2 text-ink-mut">Tap the heart on anything you love — it'll show up here.</p>
            <Link href="/menu" className="btn-accent mt-6">Browse the menu</Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
