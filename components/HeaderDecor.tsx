import { Cake, Sparkles, Heart } from "lucide-react";

/**
 * Ambient, pure-CSS "spline-like" decoration for otherwise-empty page header
 * bands. Renders soft glossy floating orbs + drifting blurred blobs + a couple
 * of faint brand icons, filling the dead space on the right of a header.
 *
 * Zero JS / no WebGL — it's just gradients + the existing float/blob-drift CSS
 * keyframes, so it costs nothing and auto-stills under prefers-reduced-motion
 * (the global reduced-motion block zeroes CSS animation durations).
 *
 * tone="light" → for cream/peach/sky header backgrounds.
 * tone="bold"  → for the saturated flame header background.
 */
type Tone = "light" | "bold";

const ORBS: Record<Tone, string[]> = {
  light: [
    "radial-gradient(circle at 30% 26%, rgba(255,255,255,0.72), rgba(242,106,141,0.34) 52%, rgba(199,90,104,0.30))",
    "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.78), rgba(244,156,187,0.42) 55%, rgba(242,106,141,0.32))",
    "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.66), rgba(250,229,188,0.55) 55%, rgba(244,214,160,0.42))",
  ],
  bold: [
    "radial-gradient(circle at 30% 26%, rgba(255,255,255,0.95), rgba(253,226,235,0.55) 55%, rgba(244,156,187,0.42))",
    "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.88), rgba(250,229,188,0.50) 55%, rgba(244,156,187,0.38))",
    "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.82), rgba(253,226,235,0.48) 60%, rgba(244,156,187,0.34))",
  ],
};

export default function HeaderDecor({ tone = "light" }: { tone?: Tone }) {
  const bold = tone === "bold";
  const orbs = ORBS[tone];
  const orbShadow = bold
    ? "0 24px 50px -14px rgba(92,9,21,0.40)"
    : "0 24px 50px -14px rgba(137,15,32,0.30)";
  const blobA = bold ? "bg-white/15" : "bg-flame/14";
  const blobB = bold ? "bg-peach-200/25" : "bg-peach-300/30";
  const icon = bold ? "text-white/30" : "text-wine/15";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Drifting blurred blobs — soft depth behind everything */}
      <div className={`absolute -right-16 -top-20 h-80 w-80 rounded-full ${blobA} blur-3xl animate-blob-drift`} />
      <div className={`absolute right-[18%] -bottom-24 h-96 w-96 rounded-full ${blobB} blur-3xl animate-blob-drift-alt`} />

      {/* Glossy floating orbs — the "spline-like" dimensional bits */}
      <div
        className="absolute right-[8%] top-[30%] hidden h-32 w-32 rounded-full ring-1 ring-white/40 animate-float md:block lg:h-40 lg:w-40"
        style={{ background: orbs[0], boxShadow: orbShadow }}
      />
      <div
        className="absolute right-[28%] top-[16%] hidden h-20 w-20 rounded-full ring-1 ring-white/40 animate-float-slow md:block"
        style={{ background: orbs[1], boxShadow: orbShadow, animationDelay: "1.4s" }}
      />
      <div
        className="absolute right-[20%] bottom-[16%] hidden h-16 w-16 rounded-full ring-1 ring-white/40 animate-float md:block"
        style={{ background: orbs[2], boxShadow: orbShadow, animationDelay: "2.8s" }}
      />

      {/* Faint brand icons drifting between the orbs */}
      <Sparkles className={`absolute right-[37%] top-[42%] hidden h-9 w-9 ${icon} animate-float-slow md:block`} strokeWidth={1.5} style={{ animationDelay: "0.6s" }} />
      <Cake className={`absolute right-[6%] bottom-[26%] hidden h-12 w-12 ${icon} animate-float md:block`} strokeWidth={1.25} style={{ animationDelay: "3.6s" }} />
      <Heart className={`absolute right-[33%] bottom-[30%] hidden h-7 w-7 ${icon} animate-float-slow md:block`} strokeWidth={1.5} style={{ animationDelay: "2.1s" }} />
    </div>
  );
}
