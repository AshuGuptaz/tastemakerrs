"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-reveal wrapper. Fades + lifts content into view once, with a premium
 * easeOutExpo curve. Reduced-motion safe (renders instantly, no transform).
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
  as?: keyof typeof motion;
} & Omit<HTMLMotionProps<"div">, "ref">) {
  const reduce = useReducedMotion();
  const Comp: any = as ? (motion as any)[as] : motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
