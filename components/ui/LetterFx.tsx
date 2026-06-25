"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#%&*·";

/**
 * Once UI-style "LetterFx" — text decodes from scrambled characters to the real
 * string. Triggers once on scroll-into-view. SSR-safe (first paint = real text,
 * so no hydration mismatch) and reduced-motion safe (renders static).
 */
export default function LetterFx({
  text,
  className,
  speed = 28,
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(text);
  const started = useRef(false);

  useEffect(() => {
    if (reduce || started.current || !inView) return;
    started.current = true;
    let frame = 0;
    const id = setInterval(() => {
      const revealed = Math.floor(frame / 2);
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        out += ch === " " || i < revealed ? ch : CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setDisplay(out);
      frame++;
      if (revealed >= text.length) {
        clearInterval(id);
        setDisplay(text);
      }
    }, speed);
    return () => clearInterval(id);
  }, [inView, reduce, text, speed]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{display}</span>
    </span>
  );
}
