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
import { ArrowRight, Star, ChevronDown } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

// ── Swap this with your real hero cake photo (portrait, ~1100×1375 or larger).
//    Drop the file in /public and use src="/hero-cake.jpg", or keep a remote URL.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&w=1100&q=85";

function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-dots mask-fade opacity-60" />
      <div className="absolute right-0 top-0 h-[80%] w-[60%] bg-[radial-gradient(60%_70%_at_70%_30%,rgba(249,115,22,0.30),rgba(253,186,116,0.12)_45%,transparent_72%)]" />
    </div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-10%"]);

  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const spotlight = useMotionTemplate`radial-gradient(440px circle at ${mx}px ${my}px, rgba(249,115,22,0.08), transparent 72%)`;
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
      <Backdrop />
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: spotlight }} />

      <div className="container-x relative z-10 grid items-center gap-10 pb-16 pt-20 md:grid-cols-[1.05fr_0.95fr] md:gap-12 md:pb-24 md:pt-28 lg:gap-16">
        {/* ── Left: copy ── */}
        <div className="text-center md:text-left">
          <motion.div {...fade(0)} className="flex justify-center md:justify-start">
            <span className="chip gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flame opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-flame" />
              </span>
              Small-batch · Eggless &amp; Jain-friendly
            </span>
          </motion.div>

          <motion.h1 {...fade(0.08)} className="t-display mt-6 text-balance md:max-w-[15ch]">
            Cakes worth <span className="text-gradient">remembering</span>, <span className="text-gradient">delivered</span> today.
          </motion.h1>

          <motion.p {...fade(0.16)} className="t-lead mx-auto mt-6 max-w-xl md:mx-0">
            Order a premium, baked-fresh cake in seconds — eggless on request, customised to the gram, at your door the same morning.
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-9 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Link href="/menu" className="btn-ink group px-7 text-[0.95rem]">
              Order now
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/custom-cake" className="btn-line text-[0.95rem]">Design your own</Link>
          </motion.div>

          <motion.div {...fade(0.32)} className="mt-7 flex items-center justify-center gap-2.5 text-sm text-ink-mut md:justify-start">
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-flame text-flame" />
              ))}
            </span>
            <span className="font-semibold text-ink">4.9</span>
            <span className="text-ink-mut/50">·</span>
            <span>2,000+ cakes baked &amp; loved across Lucknow</span>
          </motion.div>
        </div>

        {/* ── Right: hero cake ── */}
        <motion.div
          style={{ y: imgY }}
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.2 }}
          className="relative mx-auto w-full max-w-md md:max-w-none"
        >
          {/* warm glow behind */}
          <div aria-hidden className="absolute -inset-6 -z-10 rounded-[3rem] bg-[radial-gradient(circle_at_50%_40%,rgba(249,115,22,0.25),transparent_70%)] blur-2xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-cream-100 shadow-e3">
            <Image
              src={HERO_IMAGE}
              alt="A freshly baked celebration cake from The Taste Makerrs"
              fill
              priority
              sizes="(max-width: 768px) 90vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />

            {/* floating glass chip — top left */}
            <motion.span
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.7 }}
              className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-pill border border-white/40 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-ink shadow-e2 backdrop-blur-md"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-flame" /> Baked fresh this morning
            </motion.span>

            {/* delivery card — bottom left */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.85 }}
              className="absolute bottom-4 left-4 rounded-2xl border border-white/40 bg-white/80 px-4 py-2.5 text-sm shadow-e2 backdrop-blur-md"
            >
              <div className="font-semibold text-ink">Same-day delivery</div>
              <div className="text-xs text-ink-mut">Across Lucknow, baked to order</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="relative z-10 flex justify-center pb-6"
      >
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-ink-mut">
          Scroll to explore
          <motion.span animate={reduce ? undefined : { y: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </span>
      </motion.div>
    </section>
  );
}
