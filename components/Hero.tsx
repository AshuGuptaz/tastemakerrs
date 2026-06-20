"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import MagneticButton from "./MagneticButton";
import AnimatedCounter from "./AnimatedCounter";
import Underlined from "./Underlined";
import Spline from "@splinetool/react-spline/next";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: EASE, delay },
});

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-cream-100">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-peach-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-96 w-96 rounded-full bg-flame/10 blur-3xl" />

      <div className="container-x relative z-10 grid items-center gap-14 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-28">
        {/* Copy */}
        <div className="text-center md:text-left">
          <motion.span {...fade(0)} className="pill mb-5 border border-cocoa/10">
            Small-batch · Eggless &amp; Jain-friendly options
          </motion.span>

          <motion.p {...fade(0.08)} className="mt-1 text-sm font-semibold uppercase tracking-[0.25em] text-flame md:text-base">
            A taste worth remembering
          </motion.p>

          <motion.h1 {...fade(0.16)} className="display mt-3 text-[clamp(2.8rem,7vw,5.5rem)]">
            A cake for your favorite <Underlined>memories</Underlined>.
          </motion.h1>

          <motion.p {...fade(0.24)} className="mx-auto mt-6 max-w-xl text-base text-cocoa/70 md:mx-0 md:text-lg">
            From birthdays to &ldquo;just because&rdquo; — handcrafted cakes for every moment that
            matters. Premium ingredients, baked fresh every morning.
          </motion.p>

          <motion.div {...fade(0.32)} className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <MagneticButton>
              <Link href="/menu" className="btn-primary group">
                Order Your Cake <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </MagneticButton>
            <MagneticButton strength={0.25}>
              <Link href="/custom-cake" className="btn-ghost">
                Customize Your Own
              </Link>
            </MagneticButton>
          </motion.div>

          <motion.div {...fade(0.4)} className="mt-10 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: "Cakes baked", count: { value: 2, suffix: "K+" } },
              { v: "Pure veg", count: { value: 100, suffix: "%" } },
              { v: "Google rating", count: { value: 4.9, suffix: "★", decimals: 1 } },
              { v: "Delivery", k: "Same-day" },
            ].map((s) => (
              <div key={s.v} className="glass rounded-2xl px-4 py-3 text-center md:text-left">
                <div className="font-display text-2xl font-semibold text-cocoa">
                  {s.count ? (
                    <AnimatedCounter
                      value={s.count.value}
                      suffix={s.count.suffix}
                      decimals={s.count.decimals ?? 0}
                    />
                  ) : (
                    s.k
                  )}
                </div>
                <div className="text-xs uppercase tracking-wider text-cocoa/60">{s.v}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Photo with parallax */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-soft ring-1 ring-cocoa/10 bg-cream-100">
            <Spline
              scene="https://prod.spline.design/Pi10RzgFeK1HWDbW/scene.splinecode"
              className="absolute inset-0 h-full w-full"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
            className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-pill bg-white px-5 py-3 shadow-soft ring-1 ring-cocoa/10 md:left-auto md:right-6 md:translate-x-0"
          >
            <span className="font-display text-lg font-semibold text-cocoa">Freshly baked</span>
            <span className="text-sm text-cocoa/60">every morning</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
