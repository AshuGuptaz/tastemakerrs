"use client";

import { m, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-reveal wrapper. Lifts content into view once, with a premium
 * easeOutExpo curve. Reduced-motion safe (renders instantly, no transform).
 *
 * IMPORTANT: the resting state is fully opaque (we animate translate only, never
 * opacity). Gating first-paint on opacity:0 would leave all below-the-fold
 * content blank for crawlers, OG/link-preview screenshots, print, and no-JS /
 * slow-hydration — so reveal is treated strictly as progressive enhancement.
 */
export default function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
  as,
  ...rest
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: keyof typeof m;
} & Omit<HTMLMotionProps<"div">, "ref">) {
  const reduce = useReducedMotion();
  const Comp: any = as ? (m as any)[as] : m.div;
  return (
    <Comp
      className={className}
      style={{ willChange: "transform" }}
      initial={reduce ? false : { y, scale: 0.985 }}
      whileInView={{ y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
