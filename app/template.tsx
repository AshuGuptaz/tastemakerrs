"use client";

import { motion } from "framer-motion";

/**
 * App Router `template.tsx` re-mounts on every navigation (unlike `layout.tsx`),
 * so wrapping children here gives a gentle page-transition on each route change.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
