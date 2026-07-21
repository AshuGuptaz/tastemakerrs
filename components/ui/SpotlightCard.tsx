"use client";

import { useRef, type ElementType, type ReactNode, type MouseEvent } from "react";

/**
 * Cursor-follow spotlight wrapper (adapted from React Bits' SpotlightCard).
 *
 * This component only tracks the pointer and writes --mouse-x / --mouse-y onto
 * the element; the warm flame glow itself is the `.spotlight-card` class in
 * globals.css (so it composes with any card styling passed via `className` —
 * bg, border, radius, padding all stay the consumer's). Pass `spotlightColor`
 * to override the default flame tint.
 */
interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: `rgba(${number}, ${number}, ${number}, ${number})`;
  /** Rendered element — defaults to div; pass "article"/"li" to keep semantics. */
  as?: ElementType;
}

export default function SpotlightCard({
  children,
  className = "",
  spotlightColor,
  as: Tag = "div",
}: SpotlightCardProps) {
  const ref = useRef<HTMLElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    if (spotlightColor) el.style.setProperty("--spotlight-color", spotlightColor);
  };

  return (
    <Tag ref={ref} onMouseMove={handleMouseMove} className={`spotlight-card ${className}`}>
      {children}
    </Tag>
  );
}
