"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Soft, warm, slow-drifting aurora behind the landing page — large blurred
 * orange/peach radial blobs (transform-only, GPU-friendly) + a faint grid and
 * grain so the page reads rich and alive instead of flat white. Fixed and
 * pointer-events-none, so it sits quietly behind all content. Reduced-motion
 * safe (blobs hold still).
 */
const SPRING = { repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as const };

export default function AuroraBg() {
  const reduce = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute left-[-12%] top-[-18%] h-[44rem] w-[44rem] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.22),transparent_60%)] blur-3xl"
        animate={reduce ? undefined : { x: [0, 70, 0], y: [0, 50, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 26, ...SPRING }}
      />
      <motion.div
        className="absolute right-[-14%] top-[28%] h-[42rem] w-[42rem] rounded-full bg-[radial-gradient(circle,rgba(253,186,116,0.20),transparent_62%)] blur-3xl"
        animate={reduce ? undefined : { x: [0, -60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 32, ...SPRING }}
      />
      <motion.div
        className="absolute bottom-[-18%] left-[30%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(234,88,12,0.16),transparent_64%)] blur-3xl"
        animate={reduce ? undefined : { x: [0, 45, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 38, ...SPRING }}
      />
      {/* faint structure + grain for texture */}
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "160px 160px",
        }}
      />
    </div>
  );
}
