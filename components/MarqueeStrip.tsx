"use client";

const ITEMS = [
  "Premium ingredients",
  "Eggless on request",
  "Same-day delivery",
  "Small-batch baking",
  "Made with love",
];

export default function MarqueeStrip() {
  return (
    <div className="overflow-hidden border-y border-cocoa/10 bg-flame text-white">
      <div className="marquee-track py-3.5 text-sm font-medium uppercase tracking-[0.18em]">
        {[...ITEMS, ...ITEMS, ...ITEMS].map((t, i) => (
          <span key={i} className="inline-flex items-center gap-10">
            <span>{t}</span>
            <span aria-hidden className="text-white/45">&#9670;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
