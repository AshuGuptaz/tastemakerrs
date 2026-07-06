"use client";

import { m, useReducedMotion, useAnimation } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

export default function HandDrawnCircle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const controls = useAnimation();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reduce) {
      controls.set("visible");
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Small delay so the heading text settles before the circle draws
          setTimeout(() => controls.start("visible"), 300);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [controls, reduce]);

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.8, ease: [0.43, 0.13, 0.23, 0.96] },
        opacity: { duration: 0.3 },
      },
    },
  };

  return (
    <span ref={ref} className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      {/*
        Sized via fixed-length insets, not percentage width/height — percentage
        height on an absolutely-positioned child only resolves against a parent
        with an explicit height, and this span's height comes from its inline
        text content (auto), so h-[165%] silently collapsed to 0 and let the
        circle float wherever its top-anchor happened to land.
      */}
      <m.svg
        aria-hidden
        viewBox="0 0 500 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute -inset-x-3 -inset-y-2 text-flame sm:-inset-x-4 sm:-inset-y-3"
        style={{ overflow: "visible", zIndex: 0 }}
        initial="hidden"
        animate={controls}
      >
        <m.path
          d="M 455 65
             C 490 15, 390 5, 250 5
             C 110 5, 10 35, 10 100
             C 10 165, 110 195, 250 195
             C 390 195, 490 160, 490 100
             C 490 82, 472 68, 455 65"
          fill="none"
          strokeWidth="5.5"
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
