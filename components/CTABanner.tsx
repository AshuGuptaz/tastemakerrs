"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Underlined from "./Underlined";

export default function CTABanner() {
  return (
    <section className="bg-cream-100 py-16 text-center">
      <div className="container-x">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-section"
        >
          Let&apos;s make <Underlined>sweet</Underlined> plans
        </motion.h2>
        <p className="mx-auto mt-3 max-w-xl text-cocoa/70">
          Contact us to order a cake or to help organize your event.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/menu" className="btn-primary">Order your Cake</Link>
          <Link href="/contact" className="btn-ghost">Talk to us</Link>
        </div>
      </div>
    </section>
  );
}
