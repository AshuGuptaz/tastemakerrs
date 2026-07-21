"use client";

import { m, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useMemo } from "react";

type Snapshot = { filter?: string; opacity?: number; y?: number };

function buildKeyframes(from: Snapshot, steps: Snapshot[]) {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);
  const kf: Record<string, (string | number | undefined)[]> = {};
  keys.forEach((k) => {
    kf[k] = [from[k as keyof Snapshot], ...steps.map((s) => s[k as keyof Snapshot])];
  });
  return kf as Parameters<typeof m.span>[0]["animate"] & object;
}

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Snapshot;
  animationTo?: Snapshot[];
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
}

export default function BlurText({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (t) => t,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) {
  const reduce = useReducedMotion();
  const elements = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo<Snapshot>(
    () =>
      direction === "top"
        ? { filter: "blur(10px)", opacity: 0, y: -50 }
        : { filter: "blur(10px)", opacity: 0, y: 50 },
    [direction]
  );

  const defaultTo = useMemo<Snapshot[]>(
    () => [
      { filter: "blur(5px)", opacity: 0.5, y: direction === "top" ? 5 : -5 },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction]
  );

  const from = animationFrom ?? defaultFrom;
  const to = animationTo ?? defaultTo;
  const stepCount = to.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  return (
    <p ref={ref} className={className} style={{ display: "flex", flexWrap: "wrap" }}>
      {elements.map((segment, index) => (
        <m.span
          key={index}
          className="inline-block will-change-[transform,filter,opacity]"
          initial={reduce ? false : from}
          animate={inView ? buildKeyframes(from, to) : from}
          transition={{
            duration: totalDuration,
            times,
            delay: reduce ? 0 : (index * delay) / 1000,
            ease: easing,
          }}
          onAnimationComplete={
            index === elements.length - 1 ? onAnimationComplete : undefined
          }
        >
          {segment === " " ? " " : segment}
          {animateBy === "words" && index < elements.length - 1 && " "}
        </m.span>
      ))}
    </p>
  );
}
