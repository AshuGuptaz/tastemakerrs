"use client";

import Image from "next/image";
import { useReducedMotion } from "framer-motion";

/**
 * Full-cover looping background video with a still-poster fallback for
 * reduced-motion users. Purely decorative — the parent supplies the scrim
 * and foreground content.
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
