"use client";

/**
 * Masked word-reveal headline — the "award-site" hero entrance (buttermax /
 * Awwwards style): each word rises out of an overflow-hidden clip while a blur
 * resolves, staggered across the line. Adapted from the KokonutUI text-reveal
 * pattern to this project's stack — `m` (LazyMotion domMax, not a standalone
 * `motion/react` import), flame-toned accent segments, and reduced-motion safe.
 *
 * Renders real word text inside the clip (not a canvas/image), so the headline
 * stays selectable and crawlable — the animation is pure progressive polish.
 */

import { Fragment, type ElementType } from "react";
import { m, useReducedMotion } from "framer-motion";

/** A run of the headline that shares one style (e.g. the flame accent word). */
export type RevealSegment = { text: string; className?: string };

const EASE = [0.16, 1, 0.3, 1] as const; // easeOutExpo — the "expensive" reveal curve

interface TextRevealProps {
  segments: RevealSegment[];
  className?: string;
  /** ms before the first word starts (for choreographing against the eyebrow). */
  startDelay?: number;
  /** ms between consecutive words. */
  stagger?: number;
  /** each word's rise duration, in seconds. */
  duration?: number;
  as?: ElementType;
}

export default function TextReveal({
  segments,
  className,
  startDelay = 0,
  stagger = 75,
  duration = 0.9,
  as: Tag = "h1",
}: TextRevealProps) {
  const reduce = useReducedMotion();

  // Flatten to word tokens, each remembering which segment style it belongs to.
  const words = segments.flatMap((s, si) =>
    s.text.split(" ").filter(Boolean).map((w, wi) => ({ w, className: s.className, key: `${si}-${wi}` }))
  );

  if (reduce) {
    return (
      <Tag className={className}>
        {segments.map((s, i) => (
          <span key={i} className={s.className}>
            {i > 0 ? " " : ""}
            {s.text}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    // aria-label carries the full phrase so assistive tech reads it as one line,
    // not a stack of disjoint words; the visual word spans are hidden from AT.
    <Tag className={className} aria-label={segments.map((s) => s.text).join(" ")}>
      {words.map(({ w, className: c, key }, i) => (
        <Fragment key={key}>
          <span
            aria-hidden
            className="inline-block overflow-hidden align-bottom"
            // pb/-mb pair gives descenders (g, y, p) room inside the clip so the
            // rising mask never shears them; align-bottom keeps the baseline honest.
            style={{ paddingBottom: "0.14em", marginBottom: "-0.14em" }}
          >
            <m.span
              className={`inline-block will-change-[transform,filter,opacity] ${c ?? ""}`}
              initial={{ y: "115%", filter: "blur(12px)", opacity: 0 }}
              animate={{ y: "0%", filter: "blur(0px)", opacity: 1 }}
              transition={{ duration, ease: EASE, delay: (startDelay + i * stagger) / 1000 }}
            >
              {w}
            </m.span>
          </span>
          {/* real inter-word space between clips (h1 is normal inline flow, not flex) */}
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </Tag>
  );
}
