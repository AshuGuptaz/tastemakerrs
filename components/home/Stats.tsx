import AnimatedCounter from "@/components/AnimatedCounter";
import Reveal from "@/components/ui/Reveal";

const STATS = [
  { value: 2, suffix: "K+", decimals: 0, label: "Cakes baked & loved" },
  { value: 4.9, suffix: "★", decimals: 1, label: "Average rating" },
  { value: 100, suffix: "%", decimals: 0, label: "Pure veg kitchen" },
  { value: 30, suffix: "+", decimals: 0, label: "Flavours on the menu" },
];

export default function Stats() {
  return (
    <section className="section pb-0">
      <div className="container-x">
        <Reveal>
          <div className="surface grid grid-cols-2 divide-line overflow-hidden md:grid-cols-4 md:divide-x">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`px-6 py-8 text-center md:py-10 ${i < 2 ? "border-b border-line md:border-b-0" : ""}`}
              >
                <div className="font-display text-[clamp(2rem,4vw,2.75rem)] font-semibold tracking-tighter2 text-ink">
                  <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals} />
                </div>
                <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-ink-mut">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
