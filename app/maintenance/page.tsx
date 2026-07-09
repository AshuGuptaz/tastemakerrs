"use client";

import { useEffect, useRef } from "react";
import { m, useReducedMotion } from "framer-motion";

export default function MaintenancePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();

  // Floating gold dust particles — skipped for prefers-reduced-motion
  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.4,
      dx: (Math.random() - 0.5) * 0.2,
      dy: -(Math.random() * 0.35 + 0.1),
      alpha: Math.random() * 0.35 + 0.08,
    }));

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,160,95,${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [reduceMotion]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      {/* Pulsing gold rings — ambient motion, skipped for prefers-reduced-motion */}
      {!reduceMotion && (
        <>
          <m.div
            className="absolute rounded-full border border-[#C4A05F]/20"
            initial={{ width: 180, height: 180, opacity: 0.7 }}
            animate={{ width: 380, height: 380, opacity: 0 }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut" }}
          />
          <m.div
            className="absolute rounded-full border border-[#C4A05F]/15"
            initial={{ width: 180, height: 180, opacity: 0.5 }}
            animate={{ width: 500, height: 500, opacity: 0 }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut", delay: 1 }}
          />
        </>
      )}

      {/* Logo */}
      <m.div
        className="relative z-10 mb-2"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo-redesign-primary.png"
          alt="The Taste Makerrs"
          className="w-[200px] md:w-[240px]"
        />
      </m.div>

      {/* Animated GIF medallion — hotlinked from Dribbble's CDN, so its white
          background is baked into the pixels (no alpha channel) and can't be
          made transparent from here. Framed as a gold-ringed medallion instead
          of a raw rectangle so the white reads as intentional, not a bug. */}
      <m.div
        className="relative z-10 mb-6 h-[150px] w-[150px] overflow-hidden rounded-full border-2 border-[#C4A05F]/50 shadow-[0_0_40px_rgba(196,160,95,0.25)] sm:h-[170px] sm:w-[170px]"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div
          className="h-full w-full bg-[url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)] bg-center bg-no-repeat bg-cover"
          aria-hidden="true"
        />
      </m.div>

      {/* Heading */}
      <m.h1
        className="relative z-10 font-display text-[clamp(1.8rem,5vw,3.2rem)] font-semibold leading-tight tracking-tight text-[#F5EDD8]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Something sweet is{" "}
        <span className="text-[#C4A05F]">coming.</span>
      </m.h1>

      {/* Subtitle */}
      <m.p
        className="relative z-10 mx-auto mt-4 max-w-sm font-sans text-[0.95rem] leading-relaxed text-[#9E8E78]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
      >
        We&apos;re baking up something special. The kitchen will reopen shortly — check back soon.
      </m.p>

      {/* Footer */}
      <m.p
        className="absolute bottom-8 z-10 font-sans text-xs text-[#5A4F44]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Questions?{" "}
        <a
          href="mailto:tastemakerrs@gmail.com"
          className="text-[#7A6A58] underline underline-offset-2 transition-colors hover:text-[#C4A05F]"
        >
          tastemakerrs@gmail.com
        </a>
      </m.p>
    </div>
  );
}
