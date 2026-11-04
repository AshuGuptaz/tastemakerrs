/**
 * Server-renderable twin of <BlurText> for the hero.
 *
 * WHY: BlurText/ShimmerText (framer-motion) SSR their text as opacity:0 and only
 * reveal after JS downloads + hydrates — on a slow phone the hero headline was
 * invisible for ~6s. This version uses the SAME keyframes/timing as BlurText
 * (blur 10→5→0px, opacity 0→.5→1, y 50→-5→0, per-word stagger) but as pure CSS
 * animations, so the cascade starts at first paint with no JS dependency.
 * Reduced-motion is handled in globals.css (.hero-word → static final state).
 */
export default function CssBlurText({
  text,
  delay,
  initialDelay = 0,
  stepDuration,
  className = "",
}: {
  text: string;
  /** ms between each word's start (same meaning as BlurText `delay`). */
  delay: number;
  /** ms before the first word starts. */
  initialDelay?: number;
  /** seconds per keyframe step (BlurText `stepDuration`); total = 2× this. */
  stepDuration: number;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <span className={className} style={{ display: "flex", flexWrap: "wrap" }}>
      {words.map((w, i) => (
        <span
          key={i}
          className="hero-word inline-block"
          style={{
            animationDuration: `${stepDuration * 2}s`,
            animationDelay: `${(initialDelay + i * delay) / 1000}s`,
          }}
        >
          {w}
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
