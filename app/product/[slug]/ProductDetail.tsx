"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { Minus, Plus, Heart, Truck, Shield, Sparkles, Leaf } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import Underlined from "@/components/Underlined";
import type { Product } from "@/types/product";

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

  return (
    <>
      <section className="bg-cream-100 py-10 md:py-16">
        <div className="container-x">
          <nav className="mb-6 text-sm text-cocoa/60">
            <Link href="/menu" className="hover:text-flame">Menu</Link>
            <span className="mx-2">/</span>
            <Link href={`/menu?cat=${product.category}`} className="hover:text-flame">{categoryLabel}</Link>
            <span className="mx-2">/</span>
            <span className="text-cocoa">{product.name}</span>
          </nav>

          <div className="grid gap-10 md:grid-cols-2">
            <motion.div
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
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="text-[12rem] drop-shadow-2xl md:text-[14rem]"
                >
                  {product.image}
                </motion.div>
              )}
              {product.bestseller && (
                <span className="absolute left-5 top-5 rounded-pill bg-flame px-4 py-1.5 text-sm font-bold uppercase text-white shadow-soft">
                  Bestseller
                </span>
              )}
            </motion.div>

            <div>
              <p className="text-sm uppercase tracking-wider text-cocoa/60">{categoryLabel}{product.unit && ` · ${product.unit}`}</p>
              <h1 className="display mt-2 text-[clamp(2.2rem,5vw,4rem)]">{product.name}</h1>
              <p className="mt-3 font-display text-3xl text-flame">₹{product.price}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {product.eggless && <span className="pill"><Leaf className="h-3.5 w-3.5 text-flame" /> Eggless option</span>}
                {product.jainFriendly && <span className="pill"><span className="h-2 w-2 rounded-full bg-green-600" /> Jain-friendly</span>}
                {product.customizable && <span className="pill"><Sparkles className="h-3.5 w-3.5 text-flame" /> Customizable</span>}
                {product.flavors.map((f) => (
                  <span key={f} className="pill">#{f}</span>
                ))}
              </div>

              <p className="mt-6 leading-relaxed text-cocoa/80">{product.description}</p>

              {/* Qty + add */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-pill border border-cocoa/15 bg-white">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center hover:text-flame">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center font-semibold">{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center hover:text-flame">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  onClick={() =>
                    add({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image }, qty)
                  }
                  className="btn-primary"
                >
                  Add to Cart · ₹{product.price * qty}
                </button>

                {product.customizable && (
                  <Link href={`/custom-cake?base=${product.slug}`} className="btn-ghost">
                    <Sparkles className="h-4 w-4" /> Customize this cake
                  </Link>
                )}

                <button className="grid h-11 w-11 place-items-center rounded-pill border border-cocoa/15 bg-white hover:text-flame" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                </button>
              </div>

              {/* Trust */}
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 text-sm text-cocoa/70"><Truck className="h-4 w-4 text-flame" /> Same-day delivery</div>
                <div className="flex items-center gap-2 text-sm text-cocoa/70"><Shield className="h-4 w-4 text-flame" /> FSSAI-certified kitchen</div>
                <div className="flex items-center gap-2 text-sm text-cocoa/70"><Sparkles className="h-4 w-4 text-flame" /> Baked fresh, never frozen</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section bg-cream-50">
          <div className="container-x">
            <h2 className="h-section">YOU MAY ALSO <Underlined>LOVE</Underlined></h2>
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
