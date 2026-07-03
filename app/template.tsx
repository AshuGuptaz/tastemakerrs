"use client";

import { m, useReducedMotion } from "framer-motion";

/**
 * App Router `template.tsx` re-mounts on every navigation (unlike `layout.tsx`),
 * so wrapping children here gives a gentle page-transition on each route change.
 * Opacity only (never transform) so it can't re-root fixed/sticky descendants.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <m.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
