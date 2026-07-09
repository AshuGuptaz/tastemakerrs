"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { m } from "framer-motion";

export default function MaintenancePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Floating gold dust particles
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
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center">
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" />

      {/* Pulsing gold rings */}
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

      {/* Logo */}
      <m.div
        className="relative z-10 mb-10"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22, delay: 0.1 }}
      >
        <Image
          src="/brand/logo-redesign-primary.png"
          alt="The Taste Makerrs"
          width={380}
          height={220}
          priority
          className="w-[260px] md:w-[340px]"
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
        className="relative z-10 mt-4 max-w-sm font-sans text-[0.95rem] leading-relaxed text-[#9E8E78]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.42 }}
      >
        We&apos;re baking up something special. The kitchen will reopen shortly — check back soon.
      </m.p>

      {/* Animated dots */}
      <m.div
        className="relative z-10 mt-10 flex items-center gap-2.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[0, 1, 2].map((i) => (
          <m.span
            key={i}
            className="h-2 w-2 rounded-full bg-[#C4A05F]"
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
          />
        ))}
      </m.div>

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
