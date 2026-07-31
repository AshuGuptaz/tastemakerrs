"use client";

import { useRef, type ReactNode } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import TextReveal, { type RevealSegment } from "@/components/ui/TextReveal";

/**
 * Dark premium page header (matches the home CTA panel): a near-black rounded
 * panel with an orange gradient glow, a pill eyebrow, a bold white headline
 * (orange-gradient accent words), and a muted subtitle. Used across every inner
 * page so the whole site shares the same premium dark moment.
 */
// Choreography for the animated (titleSegments) path — eyebrow lands first,
// words cascade, subtitle settles in after the last word starts.
const EYEBROW_MS = 60;
const HEADLINE_START_MS = 240;
const WORD_STAGGER_MS = 78;

export default function PageHeader({
  eyebrow,
  title,
  titleSegments,
  subtitle,
  scrollFx = false,
}: {
  eyebrow: string;
  /** Static headline (all pages). Ignored when `titleSegments` is provided. */
  title?: ReactNode;
  /**
   * Opt-in premium path: headline as styled word runs, animated with a masked
   * word-by-word rise (TextReveal). When set, the eyebrow + subtitle also
   * choreograph in around it. Gated per-page like scrollFx.
   */
  titleSegments?: RevealSegment[];
  subtitle?: string;
  /**
   * Opt-in scroll-linked drift + fade on the headline text as the panel scrolls
   * past. Gated per-page (not a global default) since this component is shared
   * verbatim across Menu/Kitchen/Offers/About/Contact/Custom-cake/404, and only
   * Menu has been tuned/verified for it so far.
   */
  scrollFx?: boolean;
}) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const active = scrollFx && !reduce;
  const textY = useTransform(scrollYProgress, [0, 1], active ? [0, -26] : [0, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, 1], active ? [1, 0.4] : [1, 1]);

  const animated = !!titleSegments?.length;
  const wordCount = titleSegments?.reduce((n, s) => n + s.text.trim().split(/\s+/).length, 0) ?? 0;
  // Subtitle waits until the last headline word has begun its rise.
  const subtitleDelay = (HEADLINE_START_MS + wordCount * WORD_STAGGER_MS) / 1000;

  return (
    <section ref={sectionRef} className="container-x pt-4 md:pt-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center md:rounded-[2.5rem] md:px-12 md:py-20">
          {/* orange glow mesh */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[-32%] h-[26rem] w-[34rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.50),transparent_60%)] blur-2xl" />
            <div className="absolute bottom-[-45%] right-[6%] h-72 w-72 animate-float-slow rounded-full bg-[radial-gradient(circle,rgba(253,186,116,0.35),transparent_62%)] blur-2xl" />
            <div className="absolute bottom-[-30%] left-[4%] h-64 w-64 animate-float rounded-full bg-[radial-gradient(circle,rgba(234,88,12,0.30),transparent_64%)] blur-2xl" />
            <div className="absolute inset-0 bg-grid opacity-[0.06]" />
          </div>

          <m.div className="relative z-10" style={active ? { y: textY, opacity: textOpacity } : undefined}>
            <m.span
              className="gradient-ring relative inline-flex items-center gap-2.5 overflow-hidden rounded-pill bg-white/[0.07] px-4 py-[0.45rem] text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm"
              initial={animated && !reduce ? { opacity: 0, y: 10 } : false}
              animate={animated && !reduce ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: EYEBROW_MS / 1000 }}
            >
              {/* shine sweep */}
              <span
                aria-hidden
                className="animate-shine pointer-events-none absolute inset-0"
                style={{ background: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.11) 50%, transparent 75%)", backgroundSize: "200% 100%" }}
              />
              {/* ping dot */}
              <span className="relative flex h-[5px] w-[5px] shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flame-400 opacity-60" />
                <span className="relative h-[5px] w-[5px] rounded-full bg-flame-400 shadow-[0_0_5px_2px_rgba(249,115,22,0.65)]" />
              </span>
              {eyebrow}
            </m.span>
            {animated ? (
              <TextReveal
                segments={titleSegments!}
                className="font-display mx-auto mt-6 max-w-3xl text-balance text-[clamp(2.2rem,5vw,3.8rem)] font-semibold leading-[1.05] tracking-tighter2 text-white"
                startDelay={HEADLINE_START_MS}
                stagger={WORD_STAGGER_MS}
              />
            ) : (
              <h1 className="font-display mx-auto mt-6 max-w-3xl text-balance text-[clamp(2.2rem,5vw,3.8rem)] font-semibold leading-[1.05] tracking-tighter2 text-white">
                {title}
              </h1>
            )}
            {subtitle &&
              (animated && !reduce ? (
                <m.p
                  className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 md:text-lg"
                  initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: subtitleDelay }}
                >
                  {subtitle}
                </m.p>
              ) : (
                <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65 md:text-lg">{subtitle}</p>
              ))}
          </m.div>
        </div>
      </Reveal>
    </section>
  );
}
