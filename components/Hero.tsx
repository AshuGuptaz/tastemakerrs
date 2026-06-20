"use client";

import { Component, type ReactNode, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import MagneticButton from "./MagneticButton";
import AnimatedCounter from "./AnimatedCounter";
import Underlined from "./Underlined";
// Plain client component variant — Hero is "use client", so the async
// "/next" Server-Component variant cannot be used here (it throws
// "async/await is not yet supported in Client Components").
import Spline from "@splinetool/react-spline";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay },
});

/** Static cake photo filling the aspect box — used as the Spline error fallback. */
function CakeFallback() {
  return (
    <Image
      src="/images/cakes/chocolate-rich.jpg"
      alt="Freshly baked chocolate cake"
      fill
      priority
      sizes="(max-width: 768px) 100vw, 28rem"
      className="object-cover"
    />
  );
}

/** Catches any runtime/WebGL failure from the Spline tree and shows the static cake. */
class SplineBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) return <CakeFallback />;
    return this.props.children;
  }
}

export default function Hero() {
  const [splineLoaded, setSplineLoaded] = useState(false);

  return (
    <section className="relative overflow-hidden bg-cream-100">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-peach-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-96 w-96 rounded-full bg-flame/10 blur-3xl" />

      <div className="container-x relative z-10 grid items-center gap-14 py-20 md:grid-cols-[1.05fr_0.95fr] md:py-28">
        {/* Copy */}
        <div className="text-center md:text-left">
          <motion.span {...fade(0)} className="mb-5 inline-flex items-center gap-2 rounded-pill bg-gradient-to-r from-flame/10 to-peach-200/60 border border-flame/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-flame shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-flame" />
            Small-batch · Eggless &amp; Jain-friendly
          </motion.span>

          <motion.p {...fade(0.06)} className="mt-1 text-sm font-semibold uppercase tracking-[0.25em] text-flame md:text-base">
            A taste worth remembering
          </motion.p>

          <motion.h1 {...fade(0.12)} className="display mt-3 text-[clamp(2.8rem,7vw,5.5rem)]">
            A cake for your favorite <Underlined>memories</Underlined>.
          </motion.h1>

          <motion.p {...fade(0.18)} className="mx-auto mt-6 max-w-xl text-base text-cocoa/70 md:mx-0 md:text-lg">
            From birthdays to &ldquo;just because&rdquo; — handcrafted cakes for every moment that
            matters. Premium ingredients, baked fresh every morning.
          </motion.p>

          <motion.div {...fade(0.24)} className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
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

          <motion.div {...fade(0.3)} className="mt-10 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
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

        {/* 3D cake scene */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            {/* Branded skeleton — visible until the Spline scene finishes loading */}
            <div
              aria-hidden
              className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-peach-200/40 to-cream-100 transition-opacity duration-700 ${
                splineLoaded ? "opacity-0" : "animate-pulse opacity-100"
              }`}
            />
            <SplineBoundary>
              <Spline
                scene="https://prod.spline.design/Pi10RzgFeK1HWDbW/scene.splinecode"
                onLoad={() => setSplineLoaded(true)}
                className="absolute inset-0 h-full w-full"
              />
            </SplineBoundary>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.4 }}
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
