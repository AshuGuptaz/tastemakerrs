"use client";

import { m } from "framer-motion";
import Image from "next/image";
import { Check } from "lucide-react";

export function CartToast({
  name,
  image,
  visible,
}: {
  name: string;
  image?: string;
  visible: boolean;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: -20, scale: 0.92 }}
      animate={
        visible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: -10, scale: 0.96 }
      }
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 rounded-[1.25rem] border border-line bg-canvas px-4 py-3 shadow-e3"
      style={{ minWidth: 256, maxWidth: 320 }}
    >
      {/* thumbnail */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface">
        {image && (image.startsWith("/") || image.startsWith("http")) ? (
          <Image src={image} alt={name} fill sizes="48px" className="object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center text-2xl">
            {image ?? "🎂"}
          </span>
        )}
      </div>

      {/* text */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-mut">
          Added to cart
        </span>
        <span className="truncate font-display text-[15px] leading-snug text-ink">
          {name}
        </span>
      </div>

      {/* check badge */}
      <m.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.14 }}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-flame text-white"
      >
        <Check className="h-4 w-4 stroke-[2.5]" />
      </m.div>
    </m.div>
  );
}
