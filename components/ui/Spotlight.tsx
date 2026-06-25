"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Aceternity-style "Spotlight" beam — a large blurred, skewed ellipse that
 * fades/drifts in behind hero content. Pure SVG + framer-motion.
 */
export default function Spotlight({
  className = "",
  fill = "rgba(242,106,141,0.22)",
}: {
  className?: string;
  fill?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      aria-hidden
      initial={reduce ? false : { opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.4, ease: "easeOut" }}
      className={`pointer-events-none absolute -z-10 h-[140%] w-[140%] ${className}`}
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#spotlight-blur)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
        />
      </g>
      <defs>
        <filter
          id="spotlight-blur"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="151" />
        </filter>
      </defs>
    </motion.svg>
  );
}
