"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import { ArrowRight, Star, Sparkles, Signal, Wifi, BatteryFull, ChevronDown, Check } from "lucide-react";
import LetterFx from "@/components/ui/LetterFx";

const EASE = [0.22, 1, 0.36, 1] as const;

function Backdrop() {
  // White top, orange glow rising from the bottom behind the phone (shape.ai style).
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-dots mask-fade opacity-60" />
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[radial-gradient(60%_80%_at_50%_100%,rgba(249,115,22,0.42),rgba(253,186,116,0.18)_45%,transparent_75%)]" />
    </div>
  );
}

const ORDER = [
  { name: "Classic Vanilla", meta: "500g · Eggless", price: "₹450", emoji: "🎂", tag: "Bestseller" },
  { name: "Chocolate Truffle", meta: "1kg · Custom", price: "₹650", emoji: "🍫", tag: "Today" },
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[270px] sm:w-[290px]">
      <div className="relative rounded-[2.8rem] border-[11px] border-ink bg-ink shadow-e3">
        <div className="absolute left-1/2 top-2 z-20 h-[22px] w-24 -translate-x-1/2 rounded-full bg-ink" />
        <div className="overflow-hidden rounded-[2rem] bg-white">
          {/* status bar */}
          <div className="flex items-center justify-between px-5 pb-1 pt-3.5 text-[11px] font-semibold text-ink">
            <span>9:41</span>
            <span className="flex items-center gap-1.5">
              <Signal className="h-3 w-3" /> <Wifi className="h-3 w-3" /> <BatteryFull className="h-3.5 w-3.5" />
            </span>
          </div>
          {/* header */}
          <div className="flex items-center justify-between px-5 py-2.5">
            <span className="text-[15px] font-bold tracking-tight text-ink">Your cart</span>
            <span className="text-xs font-semibold text-flame">See all ›</span>
          </div>
          {/* order cards */}
          <div className="space-y-2.5 px-4 pb-4">
            {ORDER.map((o) => (
              <div key={o.name} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5 shadow-e1">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-peach-200 to-peach-100 text-xl">{o.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-semibold text-ink">{o.name}</div>
                  <div className="text-[11px] text-ink-mut">{o.meta}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-bold text-ink">{o.price}</div>
                  <div className="text-[10px] font-semibold text-flame">{o.tag}</div>
                </div>
              </div>
            ))}
            <button className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-flame py-3 text-[13px] font-semibold text-white">
              <Check className="h-4 w-4" /> Checkout · ₹1,100
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const phoneY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-8%"]);

  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const spotlight = useMotionTemplate`radial-gradient(440px circle at ${mx}px ${my}px, rgba(249,115,22,0.10), transparent 72%)`;
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

      <div className="container-tight relative z-10 pt-24 text-center md:pt-32">
        <motion.div {...fade(0)} className="flex justify-center">
          <span className="chip">
            <Sparkles className="h-3.5 w-3.5 text-flame" />
            <LetterFx text="Small-batch · Eggless & Jain-friendly" />
          </span>
        </motion.div>

        <motion.h1 {...fade(0.08)} className="t-display mx-auto mt-6 max-w-[16ch] text-balance">
          Cakes worth <span className="text-gradient">remembering</span>, <span className="text-gradient">delivered</span> today.
        </motion.h1>

        <motion.p {...fade(0.16)} className="t-lead mx-auto mt-6 max-w-xl">
          Order a premium, baked-fresh cake in seconds — eggless on request, customised to the gram, at your door the same morning.
        </motion.p>

        <motion.div {...fade(0.24)} className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/menu" className="btn-ink group px-7 text-[0.95rem]">
            Order now
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link href="/custom-cake" className="btn-line text-[0.95rem]">Design your own</Link>
        </motion.div>

        <motion.div {...fade(0.32)} className="mt-7 flex items-center justify-center gap-2.5 text-sm text-ink-mut">
          <span className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-flame text-flame" />
            ))}
          </span>
          <span className="font-semibold text-ink">4.9</span>
          <span className="text-ink-mut/50">·</span>
          <span>2,000+ cakes baked &amp; loved</span>
        </motion.div>
      </div>

      {/* Phone mockup */}
      <motion.div
        style={{ y: phoneY }}
        initial={reduce ? false : { opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.3 }}
        className="relative z-10 mt-14 md:mt-16"
      >
        <PhoneMockup />
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="relative z-10 mt-12 flex justify-center pb-4"
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
