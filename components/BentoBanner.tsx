"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function BentoBanner() {
  const reduced = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-peach-100 py-20 md:py-32">
      <div className="container-x relative">
        {/* Echoed huge type — one solid, one outline */}
        <div className="select-none">
          {[
            { stroke: false },
            { stroke: true },
          ].map((line, i) => (
            <motion.h2
              key={i}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
              className="display text-[clamp(3.5rem,14vw,12rem)] text-cocoa/95"
              style={
                line.stroke
                  ? { WebkitTextStroke: "2px rgb(137 15 32 / 0.5)", color: "transparent" }
                  : undefined
              }
            >
              BENTO CAKE
            </motion.h2>
          ))}
        </div>

        {/* Bento medallion — real photo (desktop only) */}
        <motion.div
          initial={reduced ? false : { scale: 0.92, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute right-[6%] top-1/2 hidden -translate-y-1/2 md:block"
        >
          <div className="relative h-44 w-44 overflow-hidden rounded-full shadow-soft ring-4 ring-white md:h-72 md:w-72">
            <Image src="https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?auto=format&fit=crop&w=900&q=80" alt="Bento cake" fill sizes="(max-width: 768px) 176px, 288px" className="object-cover" />
          </div>
        </motion.div>

        {/* Pills — inline-flow row on mobile, scattered absolute positioning at md+ */}
        <div className="mt-6 flex flex-wrap gap-2 md:mt-0 md:block">
          <motion.span initial={reduced ? false : { opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="pill relative md:absolute md:right-[10%] md:top-[14%]">Custom Design</motion.span>
          <motion.span initial={reduced ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="pill relative bg-flame text-white md:absolute md:left-1/3 md:top-[34%]">Fast Delivery</motion.span>
          <motion.span initial={reduced ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
            className="pill relative md:absolute md:right-[18%] md:bottom-[22%]">No Minimum Order</motion.span>
          <motion.span initial={reduced ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
            className="pill relative md:absolute md:left-[8%] md:bottom-[12%]">Premium Ingredients</motion.span>
        </div>

        <div className="relative z-10 mt-10">
          <Link href="/custom-cake" className="btn-primary">Customize a Bento Cake →</Link>
        </div>
      </div>
    </section>
  );
}
