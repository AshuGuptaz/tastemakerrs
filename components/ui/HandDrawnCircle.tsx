"use client";

import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Wraps a word/phrase inside a heading with a hand-drawn circle that draws
 * itself in when scrolled into view — a warm, handcrafted accent.
 *
 * Adapted from KokonutUI's HandWrittenTitle to this project's conventions:
 * uses `m` (LazyMotion domMax), the flame accent, `whileInView` instead of
 * on-mount, and respects reduced-motion.
 */
export default function HandDrawnCircle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.6, ease: [0.43, 0.13, 0.23, 0.96] },
        opacity: { duration: 0.4 },
      },
    },
  };

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <m.svg
        aria-hidden
        viewBox="0 0 500 180"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[150%] w-[122%] -translate-x-1/2 -translate-y-1/2 text-flame"
        initial={reduce ? "visible" : "hidden"}
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <m.path
          d="M 355 26
             C 470 62, 452 138, 250 158
             C 70 158, 30 130, 34 92
             C 38 40, 150 22, 250 22
             C 340 22, 372 44, 372 44"
          fill="none"
          strokeWidth="6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={draw}
          className="opacity-70"
        />
      </m.svg>
    </span>
  );
}
