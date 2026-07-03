"use client";

import { m, AnimatePresence } from "framer-motion";
import { useCartUI } from "@/context/CartUIContext";

const SIZE = 72;

/**
 * Renders any in-flight "fly to cart" ghost images. Each one arcs from where
 * the product was added to the cart icon (#cart-fab), shrinking as it goes.
 */
export default function FlyToCart() {
  const { flyers, removeFlyer } = useCartUI();

  function targetCenter() {
    const el = typeof document !== "undefined" && document.getElementById("cart-fab");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9990]" aria-hidden>
      <AnimatePresence>
        {flyers.map((f) => {
          const to = targetCenter();
          if (!to) return null;
          return (
            <m.img
              key={f.id}
              src={f.image}
              alt=""
              initial={{
                position: "fixed",
                top: f.from.y - SIZE / 2,
                left: f.from.x - SIZE / 2,
                width: SIZE,
                height: SIZE,
                borderRadius: 16,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                // Vertical toss arc: lift above both points, then drop into the cart.
                top: [
                  f.from.y - SIZE / 2,
                  Math.min(f.from.y, to.y) - 80 - SIZE / 2,
                  to.y - SIZE / 2,
                ],
                left: to.x - SIZE / 2,
                scale: 0.18,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 0.75,
                ease: [0.5, 0, 0.2, 1],
                top: { times: [0, 0.35, 1], ease: [0.34, 1.56, 0.64, 1] },
                opacity: { duration: 0.75, times: [0, 0.8, 1] },
              }}
              onAnimationComplete={() => removeFlyer(f.id)}
              className="object-cover shadow-soft ring-2 ring-white"
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
