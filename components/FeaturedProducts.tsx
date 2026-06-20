"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import Underlined from "./Underlined";
import { getBestsellers } from "@/lib/products";

export default function FeaturedProducts() {
  const items = getBestsellers(8);
  return (
    <section className="section bg-cream-50">
      <div className="container-x">
        <div className="flex items-end justify-between gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-section"
          >
            Baked <Underlined>fresh</Underlined> — bestsellers
          </motion.h2>
          <Link href="/menu" className="hidden md:inline-flex btn-ghost">See all</Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
        <div className="mt-8 text-center md:hidden">
          <Link href="/menu" className="btn-ghost">See all</Link>
        </div>
      </div>
    </section>
  );
}
