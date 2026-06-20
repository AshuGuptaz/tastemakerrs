"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  // Dot follows cursor tightly
  const dotX = useSpring(mx, { stiffness: 1200, damping: 50 });
  const dotY = useSpring(my, { stiffness: 1200, damping: 50 });

  // Ring lags behind for fluid feel
  const ringX = useSpring(mx, { stiffness: 120, damping: 18 });
  const ringY = useSpring(my, { stiffness: 120, damping: 18 });

  useEffect(() => {
    setMounted(true);
    // Only activate on pointer-fine devices (not touch)
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.documentElement.classList.add("custom-cursor-active");

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const watchInteractives = () => {
      document.querySelectorAll("a, button, [role=button], label, select, input, textarea").forEach((el) => {
        el.addEventListener("mouseenter", () => setHovered(true));
        el.addEventListener("mouseleave", () => setHovered(false));
      });
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    watchInteractives();

    // Re-attach on any new interactive element
    const observer = new MutationObserver(watchInteractives);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      observer.disconnect();
    };
  }, [mx, my]);

  if (!mounted) return null;

  return (
    <>
      {/* Dot */}
      <motion.div
        style={{ x: dotX, y: dotY, opacity: visible ? 1 : 0 }}
        animate={{ scale: hovered ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame"
      />
      {/* Ring */}
      <motion.div
        style={{ x: ringX, y: ringY, opacity: visible ? 1 : 0 }}
        animate={{
          scale: hovered ? 1.8 : 1,
          backgroundColor: hovered ? "rgba(242,106,141,0.12)" : "transparent",
        }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        className="pointer-events-none fixed left-0 top-0 z-[9998] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-flame/50"
      />
    </>
  );
}
