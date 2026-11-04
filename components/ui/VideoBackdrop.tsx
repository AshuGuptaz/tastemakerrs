"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

/**
 * Full-cover looping background video with a still-poster fallback for
 * reduced-motion users. Purely decorative — the parent supplies the scrim
 * and foreground content.
 *
 * PERF: nothing (video OR poster) is requested until the backdrop is within
 * ~400px of the viewport. Used far down the page, an eager <video poster> was
 * costing ~2.8MB on first load for a section nobody had scrolled to yet.
 */
export default function VideoBackdrop({
  src,
  poster,
  className = "",
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!near) return <div ref={wrapRef} aria-hidden className="h-full w-full" />;

  if (reduce) {
    return (
      <Image
        src={poster}
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <video
      className={`h-full w-full object-cover ${className}`}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
