"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function BentoBanner() {
  return (
    <section className="relative overflow-hidden bg-peach-100 py-20 md:py-32">
      <div className="container-x relative">
        {/* Repeated huge type */}
        <div className="select-none">
          {["BENTO CAKE", "BENTO CAKE", "BENTO CAKE"].map((t, i) => (
            <motion.h2
              key={i}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
              className="display text-[clamp(3.5rem,14vw,12rem)] text-cocoa/95"
            >
              {t}
            </motion.h2>
          ))}
        </div>

        {/* Floating bento medallion — real photo */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute right-[6%] top-1/2 -translate-y-1/2"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="h-44 w-44 overflow-hidden rounded-full shadow-soft ring-8 ring-white md:h-72 md:w-72"
          >
            <Image src="https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?auto=format&fit=crop&w=900&q=80" alt="Bento cake" fill sizes="(max-width: 768px) 176px, 288px" className="object-cover" />
          </motion.div>
        </motion.div>

        {/* Floating pills */}
        <motion.span initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="pill absolute right-[10%] top-[14%]">Custom Design</motion.span>
        <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          className="pill absolute left-1/3 top-[34%] bg-flame text-white">Fast Delivery</motion.span>
        <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
          className="pill absolute right-[18%] bottom-[22%]">No Minimum Order</motion.span>
        <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
          className="pill absolute left-[8%] bottom-[12%]">Premium Ingredients</motion.span>

        <div className="relative z-10 mt-10">
          <Link href="/custom-cake" className="btn-primary">Customize a Bento Cake →</Link>
        </div>
      </div>
    </section>
  );
}
