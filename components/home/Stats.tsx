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
    <section className="section pt-12 pb-8 md:pt-16 md:pb-10">
      <div className="container-x">
        <Reveal>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="surface bg-grid relative overflow-hidden p-6 md:p-7">
                <div className="font-display text-[clamp(2.1rem,4.5vw,3.1rem)] font-semibold leading-none tracking-tighter2 text-ink">
                  <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals} />
                </div>
                <div className="mt-2.5 text-[0.8rem] font-medium leading-snug text-ink-mut">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
