"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Magnetic from "@/components/ui/Magnetic";
import Typewriter from "@/components/ui/Typewriter";

const EASE = [0.22, 1, 0.36, 1] as const;
// easeOutExpo — the signature "expensive" reveal curve (Locomotive / SOTD).
const REVEAL = [0.16, 1, 0.3, 1] as const;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&w=1600&q=85";

export default function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Slow Ken-Burns push + parallax on the cake; content drifts up & fades out.
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "12%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-16%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Masked per-line reveal: each line is clipped by an overflow-hidden wrapper and
  // slides up from below. The mask IS the reveal — no opacity fade on the lines.
  const line = (delay: number) => ({
    initial: reduce ? false : { y: "110%" },
    animate: { y: 0 },
    transition: { duration: 1, ease: REVEAL, delay },
  });
  const fadeUp = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE, delay },
  });

  return (
    <section ref={ref} className="relative isolate h-[100svh] min-h-[640px] overflow-hidden -mt-[72px] md:-mt-[76px]">
      {/* full-bleed cake — the atmosphere (isolate on <section> keeps these layers
          inside the hero's own stacking context; positive z so they never fall
          behind the page background) */}
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 z-0">
        <Image
          src={HERO_IMAGE}
          alt="A freshly baked celebration cake from The Taste Makerrs"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* warm espresso scrim (not neutral ink) so the shadows read edible */}
      <div
        aria-hidden
        className="absolute inset-0 z-[1] bg-gradient-to-t from-[#1A120B]/90 via-[#1A120B]/30 to-[#1A120B]/55"
      />
      {/* warm ember glow rising from the bottom-left, behind the type */}
      <div
        aria-hidden
        className="absolute inset-0 z-[2] bg-[radial-gradient(80%_60%_at_15%_100%,rgba(214,122,71,0.22),transparent_60%)]"
      />

      {/* content anchored bottom-left, editorial-poster style */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x absolute inset-x-0 bottom-0 z-10 pb-[clamp(3rem,9vh,7rem)] pt-28"
      >
        <div className="max-w-3xl">
          {/* eyebrow — small-caps over the scrim */}
          <motion.div
            {...fadeUp(0.1)}
            className="mb-6 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flame-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-flame-400" />
            </span>
            Small-batch · Eggless &amp; Jain-friendly
          </motion.div>

          {/* headline — Fraunces, one italic accent word, masked-line entrance */}
          <h1 className="t-display text-white">
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span {...line(0.15)} className="block">
                Cakes worth <em className="italic text-flame-400">remembering</em>.
              </motion.span>
            </span>
            <span className="mt-1 block overflow-hidden pb-[0.1em]">
              <motion.span
                {...line(0.27)}
                className="block font-display text-[0.42em] font-normal leading-snug tracking-wide text-white/75"
              >
                Baked fresh, made for{" "}
                <Typewriter
                  words={["birthdays", "weddings", "anniversaries", "you"]}
                  className="font-semibold text-flame-400"
                  startDelay={1200}
                />
              </motion.span>
            </span>
          </h1>

          {/* CTAs — single primary + quiet text link (rating lives in the TrustStrip below) */}
          <motion.div
            {...fadeUp(0.6)}
            className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <Magnetic className="block w-full sm:inline-block sm:w-auto">
              <Link href="/menu" className="btn-accent group w-full justify-center px-7 text-[0.95rem]">
                Order now
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <Link
              href="/custom-cake"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              or design your own
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* scroll cue — desktop only to avoid overlapping the mobile CTA */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute inset-x-0 bottom-5 z-10 hidden justify-center sm:flex"
      >
        <span className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white/55">
          Scroll
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
