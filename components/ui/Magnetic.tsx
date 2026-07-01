"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Magnetic wrapper — the element springs a fraction of the way toward the
 * cursor while it's within `radius`px, then snaps back on leave. The canonical
 * Cuberto/Awwwards "premium" CTA microinteraction.
 *
 * GPU transform only. Disabled for reduced-motion AND coarse (touch) pointers,
 * where there's no cursor to follow.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  radius = 90,
  className = "inline-block",
}: {
  children: ReactNode;
  strength?: number;
  radius?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const f = Math.min(Math.hypot(dx, dy), radius) / radius;
    x.set(dx * strength * f);
    y.set(dy * strength * f);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x: reduce ? 0 : sx, y: reduce ? 0 : sy }}
      className={`${className} [@media(pointer:coarse)]:!transform-none`}
    >
      {children}
    </motion.div>
  );
}
