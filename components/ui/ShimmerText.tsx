"use client";

/**
 * Adapted from KokonutUI's Shimmer Text (@dorianbaffier, MIT) for this project's
 * LazyMotion setup: `m` instead of `motion` (domMax context, not a standalone
 * `motion/react` import), a flame-toned sweep instead of neutral gray so it stays
 * on-brand, and an inline `span` (no wrapping layout div) so it can sit inside a
 * headline. The blur/opacity/y entrance and the infinite shimmer loop run on the
 * same element via per-property transitions, so callers don't have to sequence
 * "reveal, then shimmer" themselves.
 */

import { m, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShimmerTextProps {
  text: string;
  className?: string;
  /** Seconds to wait before the reveal starts (for choreographing against sibling copy). */
  delay?: number;
  /** Reveal duration, in seconds. */
  revealDuration?: number;
  /** One shimmer sweep's duration, in seconds — loops forever. */
  shimmerDuration?: number;
}

export default function ShimmerText({
  text,
  className,
  delay = 0,
  revealDuration = 1.4,
  shimmerDuration = 2.5,
}: ShimmerTextProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={cn("italic text-flame-400", className)}>{text}</span>;
  }

  return (
    <m.span
      className={cn(
        "inline-block bg-[length:200%_100%] bg-gradient-to-r from-flame-400 via-wheat-50 to-flame-400 bg-clip-text italic text-transparent will-change-[filter,transform,opacity]",
        className
      )}
      initial={{ filter: "blur(10px)", opacity: 0, y: 50, backgroundPosition: "200% center" }}
      animate={{ filter: "blur(0px)", opacity: 1, y: 0, backgroundPosition: "-200% center" }}
      transition={{
        filter: { duration: revealDuration, delay, ease: [0.16, 1, 0.3, 1] },
        opacity: { duration: revealDuration, delay, ease: [0.16, 1, 0.3, 1] },
        y: { duration: revealDuration, delay, ease: [0.16, 1, 0.3, 1] },
        backgroundPosition: { duration: shimmerDuration, delay, repeat: Infinity, ease: "linear" },
      }}
    >
      {text}
    </m.span>
  );
}
