"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import animationData from "./cake-story.json";

const TOTAL = (animationData as { op: number }).op; // 300 frames @ 30fps

type Chapter = { t: string; d: string; from: number; to: number };
const CHAPTERS: Chapter[] = [
  { t: "Mix", d: "Fresh eggs, milk, Belgian chocolate and real fruit — hand-whisked into a silky batter, never a pre-mix.", from: 0, to: 78 },
  { t: "Bake", d: "Into the oven: small batches at exactly the right temperature, until they rise golden and soft.", from: 78, to: 156 },
  { t: "Frost", d: "Layered, piped with fresh cream and crowned with a cherry — decorated to order, never from a fridge.", from: 156, to: 234 },
  { t: "Deliver", d: "Boxed with a hand-written card and sent off — same-day across Lucknow, as fresh as it left the kitchen.", from: 234, to: 300 },
];
const N = CHAPTERS.length;
const SOFT = [0.22, 1, 0.36, 1] as const;

function Segment({ p, index }: { p: MotionValue<number>; index: number }) {
  const width = useTransform(p, (v) => `${Math.max(0, Math.min(1, v * N - index)) * 100}%`);
  return (
    <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-ink/10">
      <motion.div style={{ width }} className="h-full rounded-full bg-flame" />
    </div>
  );
}

export default function ProcessStory() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<{ goToAndStop: (f: number, isFrame: boolean) => void; destroy: () => void } | null>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  useEffect(() => {
    let mounted = true;
    let anim: { goToAndStop: (f: number, b: boolean) => void; destroy: () => void } | null = null;
    import("lottie-web").then(({ default: lottie }) => {
      if (!mounted || !boxRef.current) return;
      anim = lottie.loadAnimation({
        container: boxRef.current,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: animationData as object,
      });
      anim.goToAndStop(reduce ? TOTAL - 1 : 0, true);
      animRef.current = anim;
    });
    return () => {
      mounted = false;
      if (anim) anim.destroy();
    };
  }, [reduce]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const a = animRef.current;
    if (!a) return;
    const f = Math.min(TOTAL - 1, Math.max(0, v * (TOTAL - 1)));
    a.goToAndStop(f, true);
    let i = CHAPTERS.findIndex((c) => f < c.to);
    if (i === -1) i = N - 1;
    setActive(i);
  });

  /* ── reduced motion: static final frame + step list ── */
  if (reduce) {
    return (
      <section className="section bg-cream-50">
        <div className="container-x grid items-center gap-10 md:grid-cols-2">
          <div className="surface aspect-[15/11] w-full overflow-hidden bg-white p-2">
            <div ref={boxRef} className="h-full w-full" />
          </div>
          <ul className="space-y-5">
            {CHAPTERS.map((c, i) => (
              <li key={c.t} className="flex gap-4">
                <span className="font-display text-2xl font-semibold text-flame">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="t-h3">{c.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-mut">{c.d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const step = CHAPTERS[active];

  return (
    <section className="relative bg-cream-50">
      <div ref={containerRef} style={{ height: `${N * 95}vh` }} className="relative">
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(253,186,116,0.18),transparent_60%)] blur-2xl" />
            <div className="absolute inset-0 bg-dots opacity-50" />
          </div>

          <div className="container-x relative z-10 grid w-full items-center gap-8 md:grid-cols-2 md:gap-12">
            {/* real Lottie animation, scrubbed by scroll */}
            <div className="relative mx-auto aspect-[15/11] w-full max-w-xl overflow-hidden rounded-[2rem] border border-line bg-gradient-to-b from-white to-cream-100 shadow-e3">
              <div ref={boxRef} className="h-full w-full" />
            </div>

            {/* narrative */}
            <div className="relative">
              <span className="pill">
                <span className="relative mr-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flame opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-flame" />
                </span>
                Watch it being made
              </span>

              <div className="mt-6 flex gap-1.5">
                {CHAPTERS.map((c, i) => <Segment key={c.t} p={scrollYProgress} index={i} />)}
              </div>

              <div className="mt-8 min-h-[15rem]">
                <AnimatePresence mode="wait">
                  <motion.div key={active} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45, ease: SOFT }}>
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-6xl font-semibold leading-none text-flame md:text-7xl">{String(active + 1).padStart(2, "0")}</span>
                      <span className="text-lg text-ink-mut">/ {String(N).padStart(2, "0")}</span>
                    </div>
                    <h3 className="font-display mt-4 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-tighter2 text-ink">{step.t}</h3>
                    <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft md:text-lg">{step.d}</p>
                    {active === N - 1 && (
                      <Link href="/menu" className="btn-accent group mt-7">
                        Order your cake
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2">
                {CHAPTERS.map((c, i) => (
                  <span key={c.t} className={`text-xs font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ${i === active ? "text-flame" : i < active ? "text-ink/45" : "text-ink/25"}`}>
                    {c.t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
