"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Honor prefers-reduced-motion: Lenis drives scroll in JS, so CSS scroll-behavior
    // can't stop it — we must skip initializing it entirely (and re-eval on change).
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let id = 0;

    const start = () => {
      if (lenis || mq.matches) return;
      lenis = new Lenis({
        duration: 1.3,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });
      const raf = (time: number) => {
        lenis!.raf(time);
        id = requestAnimationFrame(raf);
      };
      id = requestAnimationFrame(raf);
    };
    const stop = () => {
      cancelAnimationFrame(id);
      lenis?.destroy();
      lenis = null;
    };
    const onChange = () => (mq.matches ? stop() : start());

    start();
    mq.addEventListener("change", onChange);
    return () => {
      mq.removeEventListener("change", onChange);
      stop();
    };
  }, []);

  // reducedMotion="user" makes Framer auto-skip transform/layout animations to
  // their target for visitors who prefer less motion — covers the bulk of the
  // app's entrance/hover/spring motion in one place.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
