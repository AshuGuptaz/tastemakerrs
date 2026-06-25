"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import { ArrowRight, Star, Sparkles, ChevronDown } from "lucide-react";
import MagneticButton from "@/components/MagneticButton";
import Spotlight from "@/components/ui/Spotlight";
import LetterFx from "@/components/ui/LetterFx";

const EASE = [0.22, 1, 0.36, 1] as const;

function GradientMesh() {
  // Bold Stripe-style warm gradient mesh over a subtle grid.
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[60rem] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(244,156,187,0.40),transparent_70%)]" />
      {/* Once UI-style dotted backdrop */}
      <div className="absolute inset-0 bg-dots mask-fade opacity-70" />
      <div className="absolute left-1/2 top-[-14%] h-[44rem] w-[44rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(circle_at_center,rgba(242,106,141,0.45),transparent_60%)] blur-3xl" />
      <div className="absolute right-[2%] top-[8%] h-[30rem] w-[30rem] animate-float-slow rounded-full bg-[radial-gradient(circle_at_center,rgba(244,156,187,0.45),transparent_62%)] blur-3xl" />
      <div className="absolute left-[2%] top-[24%] h-[28rem] w-[28rem] animate-float rounded-full bg-[radial-gradient(circle_at_center,rgba(199,90,104,0.30),transparent_64%)] blur-3xl" />
      <div className="absolute bottom-[6%] right-[20%] h-[26rem] w-[26rem] animate-aurora rounded-full bg-[radial-gradient(circle_at_center,rgba(137,15,32,0.16),transparent_66%)] blur-3xl" />
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
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "12%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.05]);

  // Cursor-follow spotlight (fine pointers only).
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgba(242,106,141,0.10), transparent 72%)`;
  function onMove(e: React.MouseEvent<HTMLElement>) {
    if (reduce) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }

  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE, delay },
  });

  return (
    <section ref={ref} onMouseMove={onMove} className="relative overflow-hidden">
      <GradientMesh />
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-10" fill="rgba(242,106,141,0.20)" />
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: spotlight }} />

      <div className="container-tight relative z-10 pt-20 text-center md:pt-28">
        <motion.div {...fade(0)} className="flex justify-center">
          <span className="chip">
            <Sparkles className="h-3.5 w-3.5 text-flame" />
            <LetterFx text="Small-batch · Eggless & Jain-friendly" />
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
          <MagneticButton>
            <Link href="/menu" className="btn-accent group text-[0.95rem]">
              Order your cake
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </MagneticButton>
          <MagneticButton strength={0.18}>
            <Link href="/custom-cake" className="btn-line text-[0.95rem]">
              Design your own
            </Link>
          </MagneticButton>
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

      {/* Scroll cue */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="mt-12 flex justify-center"
      >
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-ink-mut">
          Scroll to explore
          <motion.span
            animate={reduce ? undefined : { y: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </span>
      </motion.div>
    </section>
  );
}
