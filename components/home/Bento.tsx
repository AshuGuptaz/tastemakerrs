import { MapPin, Star, Sparkles, CheckCircle2, Truck } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

/** "Features so good you'll love us" — 2×2 bento of mini-UI illustrations. */
export default function Bento() {
  return (
    <section className="section">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow justify-center">Why The Taste Makerrs</span>
          <h2 className="t-h2 mt-4">
            Everything a celebration <span className="text-gradient">deserves</span>.
          </h2>
          <p className="t-lead mx-auto mt-4 max-w-xl">
            Same-day delivery, every flavour and diet, top-rated by thousands — engineered into every order.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* 1 — Same-day across the city */}
          <Reveal delay={0.02}>
            <article className="surface surface-hover gradient-ring group h-full overflow-hidden p-6">
              <div className="bg-dots relative h-44 overflow-hidden rounded-[1.25rem] border border-line bg-sky-50">
                {/* route hairline */}
                <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 320 176" fill="none" preserveAspectRatio="none">
                  <path d="M40 132 C 100 120, 120 60, 196 56 S 280 72, 286 44" stroke="#F97316" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round" opacity="0.6" />
                </svg>
                {/* pins */}
                <span className="absolute left-[12%] top-[68%] h-3 w-3 rounded-full bg-flame shadow-e1 ring-4 ring-flame/15" />
                <span className="absolute left-[58%] top-[28%] h-3 w-3 rounded-full bg-flame shadow-e1 ring-4 ring-flame/15" />
                <span className="absolute left-[34%] top-[46%] h-2.5 w-2.5 rounded-full bg-ink/80" />
                <span className="absolute left-[78%] top-[60%] h-2.5 w-2.5 rounded-full bg-ink/80" />
                <span className="absolute left-[86%] top-[20%] h-2.5 w-2.5 rounded-full bg-ink/80" />
                {/* name tags */}
                <span className="absolute left-[20%] top-[18%] inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink shadow-e1">
                  <MapPin className="h-3 w-3 text-flame" /> Bandra
                </span>
                <span className="absolute bottom-3 right-3 inline-flex items-center rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-white shadow-e1">
                  Today 5pm
                </span>
              </div>
              <h3 className="t-h3 mt-5">Same-day across the city</h3>
              <p className="mt-2 text-sm text-ink-mut">
                Sealed, temperature-controlled, and at your door the same day — anywhere in the city.
              </p>
            </article>
          </Reveal>

          {/* 2 — Loved & top-rated */}
          <Reveal delay={0.06}>
            <article className="surface surface-hover gradient-ring group h-full overflow-hidden p-6">
              <div className="relative h-44 overflow-hidden rounded-[1.25rem] border border-line bg-sky-50 p-5">
                {/* bars */}
                <div className="flex h-full items-end justify-between gap-2.5">
                  {[36, 52, 44, 68, 84, 100].map((h, i) => (
                    <div
                      key={i}
                      className={`w-full rounded-md transition-all duration-500 ${i === 5 ? "bg-flame" : "bg-ink/10"}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                {/* floating rating tag */}
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink shadow-e2">
                  <Star className="h-3 w-3 fill-flame text-flame" /> 4.9
                </span>
              </div>
              <h3 className="t-h3 mt-5">Loved &amp; top-rated</h3>
              <p className="mt-2 text-sm text-ink-mut">
                Thousands of celebrations, an average 4.9★ — and the same care on every single cake.
              </p>
            </article>
          </Reveal>

          {/* 3 — Every flavour & diet */}
          <Reveal delay={0.1}>
            <article className="surface surface-hover gradient-ring group h-full overflow-hidden p-6">
              <div className="relative h-44 overflow-hidden rounded-[1.25rem] border border-line bg-sky-50">
                {/* concentric rings */}
                <span className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line/70" />
                <span className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line/70" />
                <span className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line/70" />
                {/* center dot */}
                <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame shadow-e1 ring-4 ring-flame/15" />
                {/* flavour chips placed on the rings */}
                <span className="absolute left-1/2 top-[6%] -translate-x-1/2 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink shadow-e1">
                  Vanilla
                </span>
                <span className="absolute right-[6%] top-1/2 -translate-y-1/2 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink shadow-e1">
                  Chocolate
                </span>
                <span className="absolute bottom-[6%] left-1/2 -translate-x-1/2 rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink shadow-e1">
                  Rasmalai
                </span>
                <span className="absolute left-[5%] top-1/2 -translate-y-1/2 rounded-full bg-flame px-2.5 py-1 text-[11px] font-semibold text-white shadow-e1">
                  Eggless
                </span>
              </div>
              <h3 className="t-h3 mt-5">Every flavour &amp; diet</h3>
              <p className="mt-2 text-sm text-ink-mut">
                Classic to Rasmalai, eggless to Jain-friendly — there&apos;s a perfect cake for everyone.
              </p>
            </article>
          </Reveal>

          {/* 4 — Order in seconds */}
          <Reveal delay={0.14}>
            <article className="surface surface-hover gradient-ring group h-full overflow-hidden p-6">
              <div className="relative flex h-44 flex-col justify-center gap-3 overflow-hidden rounded-[1.25rem] border border-line bg-sky-50 p-5">
                {/* incoming bubble */}
                <div className="max-w-[78%] self-start rounded-2xl rounded-bl-md bg-ink px-3.5 py-2 text-[12px] font-medium text-white shadow-e1">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Order confirmed
                  </span>
                </div>
                {/* outgoing bubble */}
                <div className="max-w-[78%] self-end rounded-2xl rounded-br-md bg-flame px-3.5 py-2 text-[12px] font-medium text-white shadow-e1">
                  <span className="inline-flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5" /> Out for delivery
                  </span>
                </div>
                {/* typing dots */}
                <div className="mt-1 inline-flex items-center gap-1 self-start rounded-full border border-line bg-white px-3 py-1.5 shadow-e1">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/30" />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/30" />
                  <span className="h-1.5 w-1.5 rounded-full bg-ink/30" />
                </div>
              </div>
              <h3 className="t-h3 mt-5">Order in seconds</h3>
              <p className="mt-2 text-sm text-ink-mut">
                Pick, pay, and track — a checkout so quick you&apos;ll be done before the kettle boils.
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
