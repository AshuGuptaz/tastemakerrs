"use client";

import { m, useScroll, useSpring, useReducedMotion } from "framer-motion";

/**
 * Thin flame-colored progress bar pinned to the top of the viewport.
 * Tracks overall page scroll. Spring-smoothed so it glides rather than jumps.
 */
export default function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  // Reduced-motion users get the raw scroll value (no spring smoothing).
  const scaleX = reduced ? scrollYProgress : smooth;

  return (
    <m.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-flame"
      aria-hidden
    />
  );
}
