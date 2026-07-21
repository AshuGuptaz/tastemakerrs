"use client";

import { m, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useMemo, type ElementType } from "react";

type Snapshot = { filter?: string; opacity?: number; y?: number };
/** A run of text that animates as a group of words but shares one style. */
type Segment = { text: string; className?: string };

// Flex items collapse ordinary whitespace between them, so word gaps must be a
// non-breaking space rendered INSIDE a span, not left to markup whitespace.
const NBSP = " ";

function buildKeyframes(from: Snapshot, steps: Snapshot[]) {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);
  const kf: Record<string, (string | number | undefined)[]> = {};
  keys.forEach((k) => {
    kf[k] = [from[k as keyof Snapshot], ...steps.map((s) => s[k as keyof Snapshot])];
  });
  return kf as Parameters<typeof m.span>[0]["animate"] & object;
}

interface BlurTextProps {
  /** Plain text (split into words or letters). Ignored if `segments` is set. */
  text?: string;
  /** Styled runs — lets one word carry a different class (e.g. the flame accent). */
  segments?: Segment[];
  delay?: number;
  /** ms to wait before the first token starts — for choreographing against siblings. */
  initialDelay?: number;
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
  /** Wrapper element — defaults to <p>; use "span" to nest inside an <h1> legally. */
  as?: ElementType;
}

type Token = { t: string; className?: string };

export default function BlurText({
  text = "",
  segments,
  delay = 200,
  initialDelay = 0,
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
  as: Tag = "p",
}: BlurTextProps) {
  const reduce = useReducedMotion();
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Segments (if given) flatten to word tokens that remember their style;
  // otherwise fall back to plain word/letter splitting.
  const hasSegments = !!segments?.length;
  const useWords = hasSegments || animateBy === "words";
  const tokens: Token[] = useMemo(() => {
    if (hasSegments) {
      return segments!.flatMap((s) =>
        s.text.split(" ").map((w) => ({ t: w, className: s.className }))
      );
    }
    return (animateBy === "words" ? text.split(" ") : text.split("")).map((t) => ({ t }));
  }, [hasSegments, segments, animateBy, text]);

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

  const spacer = (i: number) => (useWords && i < tokens.length - 1 ? NBSP : null);

  // Reduced motion: render the resolved text with no blur/translate at all.
  if (reduce) {
    return (
      <Tag ref={ref} className={className} style={{ display: "flex", flexWrap: "wrap" }}>
        {tokens.map(({ t, className: c }, i) => (
          <span key={i} className={`inline-block ${c ?? ""}`}>
            {t}
            {spacer(i)}
          </span>
        ))}
      </Tag>
    );
  }

  const from = animationFrom ?? defaultFrom;
  const to = animationTo ?? defaultTo;
  const stepCount = to.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  return (
    <Tag ref={ref} className={className} style={{ display: "flex", flexWrap: "wrap" }}>
      {tokens.map(({ t, className: c }, index) => (
        <m.span
          key={index}
          className={`inline-block will-change-[transform,filter,opacity] ${c ?? ""}`}
          initial={from}
          animate={inView ? buildKeyframes(from, to) : from}
          transition={{
            duration: totalDuration,
            times,
            delay: (initialDelay + index * delay) / 1000,
            ease: easing,
          }}
          onAnimationComplete={index === tokens.length - 1 ? onAnimationComplete : undefined}
        >
          {t}
          {spacer(index)}
        </m.span>
      ))}
    </Tag>
  );
}
