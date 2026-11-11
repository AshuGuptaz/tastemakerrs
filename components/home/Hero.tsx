"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Magnetic from "@/components/ui/Magnetic";
import Typewriter from "@/components/ui/Typewriter";
import CssBlurText from "@/components/ui/CssBlurText";
import CssShimmerText from "@/components/ui/CssShimmerText";

const EASE = [0.22, 1, 0.36, 1] as const;

const HERO_VIDEO = "/signature-cake.mp4";
const HERO_POSTER = "/signature-cake-poster.jpg";

export default function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // PERF: the poster (optimised AVIF/WebP via next/image, `priority`) is the LCP
  // element on every device. The 2.7MB loop is layered on top only AFTER load,
  // and only on a fast, non-data-saver connection and a desktop-class viewport —
  // phones on cellular get the still poster and never download the video.
  const [loadVideo, setLoadVideo] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const conn = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const slow = !!conn?.saveData || /(^|-)(slow-2g|2g|3g)$/.test(conn?.effectiveType ?? "");
    const small = window.matchMedia("(max-width: 767px)").matches;
    if (slow || small) return;
    const start = () => setLoadVideo(true);
    if (document.readyState === "complete") {
      const t = setTimeout(start, 300);
      return () => clearTimeout(t);
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, [reduce]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // PERF: pause the autoplaying hero video once it scrolls out of view — an
  // offscreen <video> still decodes/composites every frame, which showed up in
  // profiling as steady dropped frames for the entire rest of the page. Play
  // only while the hero is actually visible.
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) vid.play().catch(() => {});
        else vid.pause();
      },
      { threshold: 0.05 }
    );
    io.observe(vid);
    return () => io.disconnect();
  }, [loadVideo]);

  // Slow Ken-Burns push + parallax on the cake; content drifts up & fades out.
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "12%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["0%", "-16%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);


  return (
    <section ref={ref} className="relative isolate h-[100svh] min-h-[640px] overflow-hidden -mt-[72px] md:-mt-[76px]">
      {/* full-bleed cake — the atmosphere (isolate on <section> keeps these layers
          inside the hero's own stacking context; positive z so they never fall
          behind the page background). Reduced-motion users get the still poster
          instead of the autoplaying loop. */}
      <m.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 z-0">
        <Image
          src={HERO_POSTER}
          alt="A freshly baked celebration cake from The Taste Makerrs"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {loadVideo && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
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
          <div
            style={{ animationDelay: "0.1s" }}
            className="hero-fade mb-6 flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/70"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flame-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-flame-400" />
            </span>
            Small-batch · Eggless options
          </div>

          {/* headline — Fraunces, one shimmering accent word (kokonutui Shimmer
              Text, adapted to `m`/domMax + flame tones). "remembering." continues
              the exact same per-word stagger rhythm BlurText uses for "Cakes
              worth" (150ms initial + 300ms/word → its turn lands at 750ms) so the
              hand-off from blur-in to shimmer-in reads as one continuous cascade,
              not two separate animations. */}
          <h1 className="t-display flex flex-wrap items-baseline gap-x-[0.3em] text-white tracking-[-0.015em]">
            <CssBlurText text="Cakes worth" delay={300} stepDuration={0.7} initialDelay={150} />
            <CssShimmerText text="remembering." delay={0.75} />
          </h1>

          {/* subtitle — blur-in word by word, then typewriter follows inline */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 font-sans text-[clamp(1.05rem,2.2vw,1.9rem)] font-normal leading-snug tracking-tight text-white/75">
            <CssBlurText text="Baked fresh, made for" delay={130} stepDuration={0.45} initialDelay={950} />
            <Typewriter
              words={["birthdays", "weddings", "anniversaries", "you"]}
              className="font-semibold text-flame-400"
              startDelay={2200}
            />
          </div>

          {/* CTAs — single primary + quiet text link (rating lives in the TrustStrip below) */}
          <div
            style={{ animationDelay: "1.5s" }}
            className="hero-fade mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
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
          </div>
        </div>
      </m.div>

      {/* scroll cue — desktop only to avoid overlapping the mobile CTA */}
      <m.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
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
