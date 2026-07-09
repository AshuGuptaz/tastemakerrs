"use client";

import { useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";

const DOTS = ["·", "·", "·"];

export default function MaintenancePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Floating sugar-dust particles
  useEffect(() => {
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

    const particles = Array.from({ length: 38 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.25,
      dy: -(Math.random() * 0.4 + 0.15),
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214,122,71,${p.alpha})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-canvas px-6 text-center">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      {/* Pulsing ring */}
      <m.div
        className="absolute rounded-full border border-flame/20"
        initial={{ width: 160, height: 160, opacity: 0.6 }}
        animate={{ width: 340, height: 340, opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
      />
      <m.div
        className="absolute rounded-full border border-flame/15"
        initial={{ width: 160, height: 160, opacity: 0.5 }}
        animate={{ width: 440, height: 440, opacity: 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.9 }}
      />

      {/* Icon */}
      <m.div
        className="relative z-10 mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-flame/10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <span className="text-4xl">🎂</span>
      </m.div>

      {/* Wordmark */}
      <m.p
        className="relative z-10 mb-3 font-sans text-xs font-semibold uppercase tracking-widest text-flame"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        The Taste Makerrs
      </m.p>

      {/* Heading */}
      <m.h1
        className="font-display relative z-10 text-[clamp(2.2rem,6vw,4rem)] font-semibold leading-tight tracking-tight text-ink"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        Something sweet is{" "}
        <span className="text-flame">coming.</span>
      </m.h1>

      {/* Subtitle */}
      <m.p
        className="relative z-10 mt-4 max-w-sm font-sans text-base leading-relaxed text-ink-mut"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        We&apos;re baking up something special. The kitchen will reopen shortly — check back soon.
      </m.p>

      {/* Animated dots */}
      <m.div
        className="relative z-10 mt-10 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {DOTS.map((_, i) => (
          <m.span
            key={i}
            className="h-2 w-2 rounded-full bg-flame"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          />
        ))}
      </m.div>

      {/* Footer note */}
      <m.p
        className="absolute bottom-8 z-10 font-sans text-xs text-ink-mut/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Questions? Write to us at{" "}
        <a href="mailto:hello@thetastemakerrs.com" className="underline underline-offset-2 hover:text-flame transition-colors">
          hello@thetastemakerrs.com
        </a>
      </m.p>
    </div>
  );
}
