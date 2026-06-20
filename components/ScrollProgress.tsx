"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin flame-colored progress bar pinned to the top of the viewport.
 * Tracks overall page scroll. Spring-smoothed so it glides rather than jumps.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-flame via-rose-500 to-flame"
      aria-hidden
    />
  );
}
