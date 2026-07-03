import type { Metadata } from "next";
import CTABanner from "@/components/CTABanner";
import PageHeader from "@/components/ui/PageHeader";
import ProcessStory from "@/components/kitchen/ProcessStory";

export const metadata: Metadata = {
  title: "Our Kitchen",
  description: "Take a peek into our kitchen — how we source, bake and pack every order.",
};

export default function KitchenPage() {
  return (
    <>
      <PageHeader
        eyebrow="Behind the scenes"
        title={<>From our <span className="text-gradient">kitchen</span> to your door.</>}
        subtitle="Watch your cake come to life — mixed, baked, frosted and delivered, all by hand."
      />

      <section className="section bg-canvas pb-12 md:pb-16">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <span className="t-eyebrow">The process</span>
            <h2 className="t-h2 mt-3">The journey of your <span className="text-gradient">cake</span></h2>
            <p className="t-lead mx-auto mt-4 max-w-xl">
              Scroll to watch every order come together — from raw ingredients to your doorstep.
            </p>
          </div>
        </div>
      </section>

      <ProcessStory />

      <section className="section bg-surface">
        <div className="container-x grid gap-8 md:grid-cols-3">
          {[
            { t: "FSSAI-registered kitchen", d: "Licensed, pure-veg and audited — hygiene logged daily." },
            { t: "Hygiene SOP", d: "ISO-22000 inspired protocols. Daily kitchen logs." },
            { t: "100% Pure Veg", d: "No eggs in our Jain line. Eggless on request for everything else." },
          ].map((b) => (
            <div key={b.t} className="card p-6">
              <h3 className="font-display text-xl">{b.t}</h3>
              <p className="mt-2 text-sm text-ink-mut">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
