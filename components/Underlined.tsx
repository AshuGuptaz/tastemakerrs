"use client";

import { motion } from "framer-motion";

/**
 * Wraps a (usually pink/flame) word so an animated hand-drawn underline draws
 * itself directly beneath it the first time it scrolls into view.
 *
 *   Loved by <Underlined>thousands</Underlined> of sweet tooths
 *
 * Uses scaleX (not SVG pathLength) so it animates reliably everywhere.
 */
export default function Underlined({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`relative inline-block pb-[0.28em] text-flame ${className}`}>
      {children}
      <motion.svg
        aria-hidden
        viewBox="0 0 200 10"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-[0.16em] w-full origin-left overflow-visible"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        <path
          d="M2 6 C55 1 145 1 198 5"
          stroke="currentColor"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      </motion.svg>
    </span>
  );
}
