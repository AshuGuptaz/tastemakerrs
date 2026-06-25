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
    <section className="section pb-0 pt-12 md:pt-16">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.75rem] bg-ink shadow-e3">
            {/* gradient glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-[-60%] h-[24rem] w-[36rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(circle,rgba(242,106,141,0.45),transparent_60%)] blur-2xl" />
              <div className="absolute bottom-[-70%] right-[6%] h-72 w-72 animate-float-slow rounded-full bg-[radial-gradient(circle,rgba(244,156,187,0.30),transparent_62%)] blur-2xl" />
              <div className="absolute inset-0 bg-grid opacity-[0.06]" />
            </div>

            <div className="relative grid grid-cols-2 md:grid-cols-4 md:divide-x md:divide-white/10">
              {STATS.map((s, i) => (
                <div
                  key={s.label}
                  className={`px-6 py-9 text-center md:py-12 ${i < 2 ? "border-b border-white/10 md:border-b-0" : ""}`}
                >
                  <div className="font-display text-[clamp(2.1rem,4vw,3rem)] font-semibold tracking-tighter2 text-white">
                    <AnimatedCounter value={s.value} suffix={s.suffix} decimals={s.decimals} />
                  </div>
                  <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-white/55">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
