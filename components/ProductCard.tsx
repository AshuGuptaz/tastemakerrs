"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCartUI } from "@/context/CartUIContext";
import type { Product } from "@/types/product";

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { add } = useCart();
  const { flyToCart } = useCartUI();
  const cardRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const [added, setAdded] = useState(false);
  const addedTimeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(addedTimeout.current), []);

  function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    flyToCart(product.image, e.currentTarget.getBoundingClientRect());
    add({ id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image });
    setAdded(true);
    clearTimeout(addedTimeout.current);
    addedTimeout.current = setTimeout(() => setAdded(false), 900);
  }

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(my, [0, 1], [4, -4]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-4, 4]), { stiffness: 300, damping: 30 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      ref={cardRef}
      initial={reduce ? false : { y: 24 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.08 }}
      style={{ rotateX, rotateY, transformPerspective: "1000px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="card group flex flex-col overflow-hidden will-change-transform"
    >
      <Link href={`/product/${product.slug}`} className={`relative grid aspect-[4/3] place-items-center ${product.bg} overflow-hidden`}>
        {product.image.startsWith("/") || product.image.startsWith("http") ? (
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -inset-[3%]"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          </motion.div>
        ) : (
          <motion.div
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-7xl drop-shadow-lg md:text-8xl"
          >
            {product.image}
          </motion.div>
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {product.bestseller && (
          <span className="absolute left-3 top-3 rounded-pill bg-flame px-3 py-1 text-xs font-bold uppercase text-white shadow">
            Bestseller
          </span>
        )}
        {product.eggless && (
          <span className="absolute right-3 top-3 rounded-pill bg-white px-2.5 py-1 text-[10px] font-bold uppercase text-cocoa shadow">
            Eggless
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h3 className="font-display text-xl leading-tight tracking-tight">{product.name}</h3>
          <span className="font-display text-lg text-flame">₹{product.price}</span>
        </div>
        {product.unit && <p className="mb-2 text-xs uppercase tracking-wider text-cocoa/50">{product.unit}</p>}
        <p className="mb-4 line-clamp-2 text-sm text-cocoa/70">{product.description}</p>

        <div className="mt-auto flex items-center gap-2">
          <Link href={`/product/${product.slug}`} className="btn-ghost flex-1 justify-center">
            View
          </Link>
          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="grid h-11 w-11 place-items-center rounded-pill bg-flame text-white shadow-soft transition-transform hover:scale-110"
            aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Check className="h-5 w-5" />
                </motion.span>
              ) : (
                <motion.span
                  key="plus"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Plus className="h-5 w-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
