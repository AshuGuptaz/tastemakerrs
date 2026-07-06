import Marquee from "@/components/ui/Marquee";

const ITEMS = [
  "Eggless on request",
  "Belgian chocolate",
  "Madagascar vanilla",
  "Same-day delivery",
  "No preservatives",
  "Small-batch baking",
  "FSSAI-certified kitchen",
];

export default function TrustBar() {
  return (
    <section className="border-y border-line bg-surface/60 py-5">
      <Marquee>
        {ITEMS.map((t) => (
          <div key={t} className="flex items-center gap-8 pr-8">
            <span className="text-sm font-medium tracking-tight text-ink-soft">{t}</span>
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-flame/50" />
          </div>
        ))}
      </Marquee>
    </section>
  );
}
