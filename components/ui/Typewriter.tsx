"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Types a word out character-by-character, holds, deletes, then advances to the
 * next — with a blinking caret trailing. One component covers both the "typing"
 * and the "rotating word" feel.
 *
 * Reduced-motion: renders the first word statically with no caret.
 */
export default function Typewriter({
  words,
  className = "",
  typeMs = 85,
  deleteMs = 40,
  holdMs = 1500,
  startDelay = 550,
}: {
  words: string[];
  className?: string;
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  startDelay?: number;
}) {
  const reduce = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [reduce, startDelay]);

  useEffect(() => {
    if (reduce || !started) return;
    const full = words[i % words.length];

    if (!deleting && text === full) {
      const t = setTimeout(() => setDeleting(true), holdMs);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setI((v) => (v + 1) % words.length);
      return;
    }
    const t = setTimeout(
      () => setText((cur) => (deleting ? full.slice(0, cur.length - 1) : full.slice(0, cur.length + 1))),
      deleting ? deleteMs : typeMs
    );
    return () => clearTimeout(t);
  }, [text, deleting, i, started, reduce, words, typeMs, deleteMs, holdMs]);

  if (reduce) return <span className={className}>{words[0]}</span>;

  return (
    <span className={className}>
      {text || "​"}
      <span className="tw-caret" aria-hidden>
        |
      </span>
    </span>
  );
}
