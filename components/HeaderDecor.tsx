import Image from "next/image";
import { Sparkles } from "lucide-react";

/**
 * Ambient decoration for otherwise-empty page header bands: real bakery photos
 * (cakes / cupcakes / cookies / treats) floating as soft circular "bubbles"
 * with white rings + drop shadows, over a couple of blurred color blobs.
 *
 * Pure CSS motion (the existing float / blob-drift keyframes) — no WebGL, tiny
 * JS — so it loads fast and auto-stills under prefers-reduced-motion.
 *
 * tone="light" → cream/peach/sky header backgrounds.
 * tone="bold"  → the saturated flame header background.
 * set          → which curated photo set to float (varies per page).
 */
type Tone = "light" | "bold";
type Treat = { src: string; alt: string };

const SETS: Record<string, Treat[]> = {
  // big, medium, medium, small (mapped to the 4 fixed slots below)
  cakes: [
    { src: "/images/cakes/strawberry.jpg", alt: "Strawberry cream cake" },
    { src: "/images/cupcakes/red-velvet-cupcake.jpg", alt: "Red velvet cupcake" },
    { src: "/images/cakes/chocolate-rich.jpg", alt: "Rich chocolate cake" },
    { src: "/images/chocolates/truffles.jpg", alt: "Chocolate truffles" },
  ],
  mixed: [
    { src: "/images/cakes/red-velvet.jpg", alt: "Red velvet cake" },
    { src: "/images/cupcakes/vanilla-cupcake.jpg", alt: "Vanilla cupcake" },
    { src: "/images/cookies/choc-chip.jpg", alt: "Chocolate-chip cookies" },
    { src: "/images/chocolates/pralines.jpg", alt: "Chocolate pralines" },
  ],
  sweets: [
    { src: "/images/cakes/pistachio.jpg", alt: "Pistachio cake" },
    { src: "/images/cupcakes/chocolate-cupcake.jpg", alt: "Chocolate cupcake" },
    { src: "/images/cookies/biscotti.jpg", alt: "Almond biscotti" },
    { src: "/images/jars/tiramisu.jpg", alt: "Tiramisu jar" },
  ],
  bakes: [
    { src: "/images/cakes/blueberry.jpg", alt: "Blueberry cake" },
    { src: "/images/muffins/blueberry-muffin.jpg", alt: "Blueberry muffin" },
    { src: "/images/cookies/oatmeal.jpg", alt: "Oatmeal cookies" },
    { src: "/images/chocolates/bark.jpg", alt: "Chocolate bark" },
  ],
};

// Fixed slots: position, size, animation + phase. Photos from the chosen set
// are dropped into these in order (big → small).
const SLOTS = [
  { pos: "right-[6%] top-[24%]",     size: "h-36 w-36 lg:h-48 lg:w-48", anim: "animate-float",      delay: "0s" },
  { pos: "right-[27%] top-[12%]",    size: "h-24 w-24 lg:h-28 lg:w-28", anim: "animate-float-slow", delay: "1.4s" },
  { pos: "right-[17%] bottom-[12%]", size: "h-28 w-28 lg:h-32 lg:w-32", anim: "animate-float",      delay: "2.8s" },
  { pos: "right-[35%] bottom-[34%]", size: "h-16 w-16 lg:h-20 lg:w-20", anim: "animate-float-slow", delay: "0.7s" },
];

export default function HeaderDecor({
  tone = "light",
  set = "mixed",
}: {
  tone?: Tone;
  set?: keyof typeof SETS;
}) {
  const bold = tone === "bold";
  const treats = SETS[set] ?? SETS.mixed;
  const shadow = bold
    ? "0 30px 60px -18px rgba(92,9,21,0.55)"
    : "0 30px 60px -18px rgba(137,15,32,0.42)";
  const blobA = bold ? "bg-white/15" : "bg-flame/14";
  const blobB = bold ? "bg-peach-200/30" : "bg-peach-300/35";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft color blobs for ambient depth behind the treats */}
      <div className={`absolute -right-16 -top-20 h-80 w-80 rounded-full ${blobA} blur-3xl animate-blob-drift`} />
      <div className={`absolute right-[16%] -bottom-24 h-96 w-96 rounded-full ${blobB} blur-3xl animate-blob-drift-alt`} />

      {/* Floating bakery photos (desktop only — they'd crowd the heading on mobile) */}
      {treats.map((t, i) => {
        const slot = SLOTS[i];
        return (
          <div
            key={t.src}
            className={`absolute ${slot.pos} ${slot.size} ${slot.anim} hidden overflow-hidden rounded-full ring-4 ring-white/85 md:block`}
            style={{ boxShadow: shadow, animationDelay: slot.delay }}
          >
            <Image src={t.src} alt={t.alt} fill sizes="200px" className="object-cover" />
            {/* subtle bottom vignette for depth */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-t from-wine/25 to-transparent" />
          </div>
        );
      })}

      {/* One small sparkle accent for a touch of sweetness */}
      <Sparkles
        className={`absolute right-[40%] top-[30%] hidden h-7 w-7 md:block ${bold ? "text-white/70" : "text-flame/60"}`}
        strokeWidth={1.75}
        style={{ animationDelay: "0.5s" }}
      />
    </div>
  );
}
