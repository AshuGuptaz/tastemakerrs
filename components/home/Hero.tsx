"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Magnetic from "@/components/ui/Magnetic";
import Typewriter from "@/components/ui/Typewriter";
import BlurText from "@/components/ui/BlurText";

const EASE = [0.22, 1, 0.36, 1] as const;
// easeOutExpo — the signature "expensive" reveal curve (Locomotive / SOTD).
const REVEAL = [0.16, 1, 0.3, 1] as const;

const HERO_VIDEO = "/signature-cake.mp4";
const HERO_POSTER = "/signature-cake-poster.jpg";

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
          behind the page background). Reduced-motion users get the still poster
          instead of the autoplaying loop. */}
      <m.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 z-0">
        {reduce ? (
          <Image
            src={HERO_POSTER}
            alt="A freshly baked celebration cake from The Taste Makerrs"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        ) : (
          <video
            className="h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={HERO_POSTER}
            aria-label="A freshly baked celebration cake from The Taste Makerrs"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        )}
      </m.div>

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
      <m.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-x absolute inset-x-0 bottom-0 z-10 pb-[clamp(3rem,9vh,7rem)] pt-28"
      >
        <div className="max-w-3xl">
          {/* eyebrow — small-caps over the scrim */}
          <m.div
            {...fadeUp(0.1)}
            className="mb-6 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flame-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-flame-400" />
            </span>
            Small-batch · Eggless options
          </m.div>

          {/* headline — Fraunces, one italic accent word, masked-line entrance */}
          <h1 className="t-display text-white">
            <span className="block overflow-hidden pb-[0.1em]">
              <m.span {...line(0.15)} className="block">
                Cakes worth <em className="italic text-flame-400">remembering</em>.
              </m.span>
            </span>
          </h1>

          {/* subtitle — blur-in word by word, then typewriter follows inline */}
          <div className="mt-2 flex flex-wrap items-center gap-x-2 font-display text-[clamp(1.15rem,2.7vw,2.3rem)] font-normal leading-snug tracking-wide text-white/75">
            <BlurText
              text="Baked fresh, made for"
              delay={90}
              animateBy="words"
              direction="bottom"
              stepDuration={0.3}
              threshold={0}
            />
            <Typewriter
              words={["birthdays", "weddings", "anniversaries", "you"]}
              className="font-semibold text-flame-400"
              startDelay={1200}
            />
          </div>

          {/* CTAs — single primary + quiet text link (rating lives in the TrustStrip below) */}
          <m.div
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
          </m.div>
        </div>
      </m.div>

      {/* scroll cue — desktop only to avoid overlapping the mobile CTA */}
      <m.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute inset-x-0 bottom-5 z-10 hidden justify-center sm:flex"
      >
        <span className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white/55">
          Scroll
          <m.span
            animate={reduce ? undefined : { y: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-4 w-4" />
          </m.span>
        </span>
      </m.div>
    </section>
  );
}
