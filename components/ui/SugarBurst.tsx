"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";

/**
 * A single global layer that pops a little burst of "sugar/flour" particles at
 * a screen point — fired from add-to-cart. Brand tones (terracotta/caramel/
 * wheat), NOT rainbow confetti, so it reads bespoke-for-a-bakery.
 *
 * Event-driven so any component can trigger it without prop-drilling:
 *   import { fireSugarBurst } from "@/components/ui/SugarBurst";
 *   fireSugarBurst(e.clientX, e.clientY);
 */

type Burst = { id: number; x: number; y: number };
const COLORS = ["#D67A47", "#E08B5A", "#F4E9D6", "#A4472A"];
const COUNT = 12;

export function fireSugarBurst(x: number, y: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ttm:sugar", { detail: { x, y } }));
}

export default function SugarBurst() {
  const [bursts, setBursts] = useState<Burst[]>([]);

  useEffect(() => {
    let n = 0;
    function onBurst(e: Event) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail;
      const id = ++n;
      setBursts((b) => [...b, { id, x, y }]);
      window.setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 750);
    }
    window.addEventListener("ttm:sugar", onBurst as EventListener);
    return () => window.removeEventListener("ttm:sugar", onBurst as EventListener);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9995]" aria-hidden>
      <AnimatePresence>
        {bursts.map((b) => (
          <span key={b.id} className="absolute" style={{ left: b.x, top: b.y }}>
            {Array.from({ length: COUNT }).map((_, i) => {
              const a = (i / COUNT) * Math.PI * 2;
              const dist = 26 + ((i * 37) % 44); // deterministic spread
              const size = 5 + (i % 3) * 2;
              return (
                <m.span
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(a) * dist, y: Math.sin(a) * dist - 14, opacity: 0, scale: 0.3 }}
                  transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute",
                    width: size,
                    height: size,
                    marginLeft: -size / 2,
                    marginTop: -size / 2,
                    borderRadius: 9999,
                    background: COLORS[i % COLORS.length],
                  }}
                />
              );
            })}
          </span>
        ))}
      </AnimatePresence>
    </div>
  );
}
