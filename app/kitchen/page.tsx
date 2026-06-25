import type { Metadata } from "next";
import { Wheat, CookingPot, Flame, Palette, Package, Truck } from "lucide-react";
import CTABanner from "@/components/CTABanner";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Our Kitchen",
  description: "Take a peek into our kitchen — how we source, bake and pack every order.",
};

const STEPS = [
  { n: "01", t: "Source", d: "Premium dairy, Belgian chocolate, fresh seasonal fruit, FSSAI-approved suppliers only.", Icon: Wheat, bg: "bg-cream-100" },
  { n: "02", t: "Mix",    d: "Hand-whisked batters, no pre-mixes. Tested for moisture and structure.", Icon: CookingPot, bg: "bg-peach-100" },
  { n: "03", t: "Bake",   d: "Convection-baked in small batches at the right temperature for the right time.", Icon: Flame, bg: "bg-cocoa-50" },
  { n: "04", t: "Frost",  d: "Layered, leveled, and frosted to order — never pre-iced.", Icon: Palette, bg: "bg-sky-100" },
  { n: "05", t: "Pack",   d: "Insulated boxes, ice gel packs in summer, custom cards on every order.", Icon: Package, bg: "bg-cream-100" },
  { n: "06", t: "Deliver",d: "Same-day in Mumbai/Pune via temperature-controlled delivery partners.", Icon: Truck, bg: "bg-peach-100" },
];

export default function KitchenPage() {
  return (
    <>
      <PageHeader
        eyebrow="Behind the scenes"
        title={<>From our <span className="text-gradient">kitchen</span> to your door.</>}
        subtitle="Six steps. Done by hand. Every single day."
      />

      <section className="section bg-cream-50">
        <div className="container-x grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card overflow-hidden">
              <div className={`relative grid aspect-[16/9] place-items-center ${s.bg}`}>
                <s.Icon className="h-16 w-16 text-wine/70" strokeWidth={1.25} />
                <span className="absolute right-5 top-3 font-display text-5xl text-wine/15">{s.n}</span>
              </div>
              <div className="p-6">
                <p className="font-display text-flame">{s.n}</p>
                <h3 className="font-display text-2xl">{s.t}</h3>
                <p className="mt-2 text-sm text-cocoa/70">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section bg-peach-100">
        <div className="container-x grid gap-8 md:grid-cols-3">
          {[
            { t: "FSSAI Certified", d: "License #20012345000789. Audited annually." },
            { t: "Hygiene SOP", d: "ISO-22000 inspired protocols. Daily kitchen logs." },
            { t: "100% Pure Veg", d: "No eggs in our Jain line. Eggless on request for everything else." },
          ].map((b) => (
            <div key={b.t} className="card p-6">
              <h3 className="font-display text-xl">{b.t}</h3>
              <p className="mt-2 text-sm text-cocoa/70">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
