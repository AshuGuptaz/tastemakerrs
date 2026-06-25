"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Star, Sparkles } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

function GradientMesh() {
  // Stripe-style slow-drifting aurora, built only from brand-accent hues.
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-grid mask-fade opacity-70" />
      <div className="absolute left-1/2 top-[-12%] h-[42rem] w-[42rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(circle_at_center,rgba(242,106,141,0.28),transparent_60%)] blur-2xl" />
      <div className="absolute right-[6%] top-[12%] h-[26rem] w-[26rem] animate-float-slow rounded-full bg-[radial-gradient(circle_at_center,rgba(244,156,187,0.30),transparent_62%)] blur-2xl" />
      <div className="absolute left-[4%] top-[28%] h-[24rem] w-[24rem] animate-float rounded-full bg-[radial-gradient(circle_at_center,rgba(137,15,32,0.14),transparent_64%)] blur-2xl" />
    </div>
  );
}

function StatChip({ className, label, value, delay }: { className: string; label: string; value: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      className={`absolute z-20 rounded-2xl border border-line bg-surface/85 px-4 py-2.5 shadow-e3 backdrop-blur-md ${className}`}
    >
      <div className="font-display text-lg font-semibold leading-none text-ink">{value}</div>
      <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-ink-mut">{label}</div>
    </motion.div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "12%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.05]);

  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE, delay },
  });

  return (
    <section ref={ref} className="relative overflow-hidden">
      <GradientMesh />

      <div className="container-tight relative z-10 pt-20 text-center md:pt-28">
        <motion.div {...fade(0)} className="flex justify-center">
          <span className="chip">
            <Sparkles className="h-3.5 w-3.5 text-flame" />
            Small-batch · Eggless &amp; Jain-friendly
          </span>
        </motion.div>

        <motion.h1 {...fade(0.08)} className="t-display mx-auto mt-6 max-w-4xl text-balance">
          Cakes worth <span className="text-gradient">remembering</span>.
        </motion.h1>

        <motion.p {...fade(0.16)} className="t-lead mx-auto mt-6 max-w-2xl">
          Handcrafted, baked-fresh-daily cakes for every moment that matters — premium
          ingredients, eggless on request, delivered same-day across the city.
        </motion.p>

        <motion.div {...fade(0.24)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/menu" className="btn-accent group text-[0.95rem]">
            Order your cake
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link href="/custom-cake" className="btn-line text-[0.95rem]">
            Design your own
          </Link>
        </motion.div>

        <motion.div {...fade(0.32)} className="mt-7 flex items-center justify-center gap-2.5 text-sm text-ink-mut">
          <span className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-flame text-flame" />
            ))}
          </span>
          <span className="font-semibold text-ink">4.9</span>
          <span className="text-ink-mut/60">·</span>
          <span>2,000+ cakes baked &amp; loved</span>
        </motion.div>
      </div>

      {/* Hero visual */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.3 }}
        className="container-x relative z-10 mt-14 md:mt-20"
      >
        <div className="relative mx-auto max-w-5xl">
          {/* soft glow base */}
          <div aria-hidden className="absolute -inset-x-10 -bottom-10 top-10 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_50%_40%,rgba(242,106,141,0.22),transparent_70%)] blur-2xl" />
          <motion.div
            style={{ y: imgY, scale: imgScale }}
            className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-line bg-surface shadow-e3 md:aspect-[16/9]"
          >
            <Image
              src="/images/cakes/chocolate-rich.jpg"
              alt="A freshly baked premium chocolate cake"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent" />
          </motion.div>

          <StatChip className="-left-3 top-8 md:left-6 md:top-12" value="100%" label="Pure veg" delay={0.7} />
          <StatChip className="-right-3 top-1/3 md:right-6" value="Same-day" label="Delivery" delay={0.85} />
          <StatChip className="bottom-6 left-1/2 -translate-x-1/2 md:bottom-10" value="Baked fresh" label="Every morning" delay={1} />
        </div>
      </motion.div>
    </section>
  );
}
