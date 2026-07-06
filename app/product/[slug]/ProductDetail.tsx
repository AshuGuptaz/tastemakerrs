"use client";

import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { useEffect, useState } from "react";
import { Minus, Plus, Heart, Truck, Shield, Sparkles, Leaf, Check } from "lucide-react";
import toast from "react-hot-toast";
import { CartToast } from "@/components/ui/CartToast";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import Underlined from "@/components/Underlined";
import type { Product } from "@/types/product";
import { formatINR } from "@/lib/format";

export default function ProductDetail({
  product,
  related,
  categoryLabel,
}: {
  product: Product;
  related: Product[];
  categoryLabel: string;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem("ttm_wishlist") || "[]").includes(product.id)); } catch {}
  }, [product.id]);

  function handleAdd() {
    add({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
    toast.custom(
      (t) => <CartToast name={product.name} image={product.image} visible={t.visible} />,
      { duration: 2400, position: "top-right" }
    );
  }

  function toggleWishlist() {
    try {
      const list: string[] = JSON.parse(localStorage.getItem("ttm_wishlist") || "[]");
      const next = list.includes(product.id) ? list.filter((x) => x !== product.id) : [...list, product.id];
      localStorage.setItem("ttm_wishlist", JSON.stringify(next));
      const on = next.includes(product.id);
      setSaved(on);
      toast.success(on ? "Saved to your wishlist ♥" : "Removed from wishlist");
    } catch {}
  }

  return (
    <>
      <section className="bg-surface py-10 md:py-16">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-mut">
            <Link href="/menu" className="hover:text-flame">Menu</Link>
            <span className="mx-2" aria-hidden>/</span>
            <Link href={`/menu?cat=${product.category}`} className="hover:text-flame">{categoryLabel}</Link>
            <span className="mx-2" aria-hidden>/</span>
            <span className="text-ink" aria-current="page">{product.name}</span>
          </nav>

          <div className="grid gap-10 md:grid-cols-2">
            <m.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative grid aspect-square place-items-center overflow-hidden rounded-xl2 ${product.bg}`}
            >
              {product.image.startsWith("/") || product.image.startsWith("http") ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="text-[12rem] drop-shadow-2xl md:text-[14rem]">
                  {product.image}
                </div>
              )}
              {product.bestseller && (
                <span className="absolute left-5 top-5 rounded-pill bg-flame px-4 py-1.5 text-sm font-bold uppercase text-white shadow-soft">
                  Bestseller
                </span>
              )}
            </m.div>

            <div>
              <p className="text-sm uppercase tracking-wider text-ink-mut">{categoryLabel}{product.unit && ` · ${product.unit}`}</p>
              <h1 className="t-h2 mt-2 text-[clamp(2.2rem,5vw,4rem)]">{product.name}</h1>
              <p className="mt-3 font-display text-3xl text-flame-700">{formatINR(product.price)}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {product.eggless && <span className="pill"><Leaf className="h-3.5 w-3.5 text-flame" /> Eggless option</span>}
                {product.customizable && <span className="pill"><Sparkles className="h-3.5 w-3.5 text-flame" /> Customizable</span>}
                {product.flavors.map((f) => (
                  <span key={f} className="pill">#{f}</span>
                ))}
              </div>

              <p className="mt-6 leading-relaxed text-ink-soft">{product.description}</p>

              {/* Qty + add */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-pill border border-line bg-white">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    aria-label="Decrease quantity"
                    className="focus-ring grid h-11 w-11 place-items-center hover:text-flame disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-semibold" aria-live="polite">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(50, q + 1))}
                    disabled={qty >= 50}
                    aria-label="Increase quantity"
                    className="focus-ring grid h-11 w-11 place-items-center hover:text-flame disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <m.button
                  onClick={handleAdd}
                  whileTap={{ scale: 0.96 }}
                  className="btn-accent min-w-[12rem] justify-center"
                >
                  {added ? <><Check className="h-4 w-4" /> Added to cart</> : `Add to Cart · ${formatINR(product.price * qty)}`}
                </m.button>

                {product.customizable && (
                  <Link href={`/custom-cake?base=${product.slug}`} className="btn-line">
                    <Sparkles className="h-4 w-4" /> Customize this cake
                  </Link>
                )}

                <button
                  onClick={toggleWishlist}
                  aria-pressed={saved}
                  aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                  className={`focus-ring grid h-11 w-11 place-items-center rounded-pill border border-line bg-white transition-colors ${saved ? "border-flame/40 text-flame" : "text-ink-mut hover:text-flame"}`}
                >
                  <Heart className={`h-5 w-5 ${saved ? "fill-flame" : ""}`} />
                </button>
              </div>

              {/* Trust */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-sm text-ink-soft"><Truck className="h-4 w-4 text-flame" /> Same-day delivery</div>
                <div className="flex items-center gap-2 text-sm text-ink-soft"><Shield className="h-4 w-4 text-flame" /> FSSAI-certified kitchen</div>
                <div className="flex items-center gap-2 text-sm text-ink-soft"><Sparkles className="h-4 w-4 text-flame" /> Baked fresh, never frozen</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section bg-transparent">
          <div className="container-x">
            <h2 className="t-h2">You may also <Underlined>love</Underlined></h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
