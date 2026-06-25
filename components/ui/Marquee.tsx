import type { ReactNode } from "react";

/**
 * Seamless, CSS-driven marquee. Renders two copies of the children and shifts
 * by -50% so the loop is jump-free. Pauses on hover; stilled under reduced
 * motion (global rule). Edges fade out for a refined finish.
 */
export default function Marquee({
  children,
  className = "",
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
}) {
  return (
    <div className={`edge-fade-x overflow-hidden ${className}`}>
      <div
        className="flex w-max items-center animate-marquee-x hover:[animation-play-state:paused]"
        style={reverse ? { animationDirection: "reverse" } : undefined}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>{children}</div>
      </div>
    </div>
  );
}
