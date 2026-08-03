"use client";

import { Star } from "lucide-react";

/** Read-only or interactive 5-star rating. */
export default function Stars({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const px = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const interactive = !!onChange;

  return (
    <div className="flex items-center gap-0.5" role={interactive ? "radiogroup" : undefined} aria-label={interactive ? "Rating" : `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= Math.round(value);
        const star = (
          <Star className={`${px} ${filled ? "fill-flame text-flame" : "fill-none text-line"}`} strokeWidth={filled ? 0 : 1.5} />
        );
        return interactive ? (
          <button key={s} type="button" onClick={() => onChange!(s)} aria-label={`${s} star${s > 1 ? "s" : ""}`} aria-checked={s === value} role="radio" className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/30 rounded">
            {star}
          </button>
        ) : (
          <span key={s}>{star}</span>
        );
      })}
    </div>
  );
}
