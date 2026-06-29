import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CTABanner from "@/components/CTABanner";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind The Taste Makerrs — small-batch bakery, premium ingredients, eggless and Jain-friendly options.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title={<>Made in a kitchen, shared with <span className="text-gradient">love</span>.</>}
        subtitle="A small-batch home bakery where every layer is whisked, every buttercream piped, and every box packed by hand."
      />

      <section className="section">
        <div className="container-x grid gap-10 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <Reveal>
            <p className="text-lg leading-relaxed text-ink-soft">
              The Taste Makerrs began with a simple idea: a cake should taste as good as it looks. We&apos;re a small-batch
              home bakery where every layer is whisked, every buttercream piped, and every box packed by hand.
            </p>
            <p className="mt-4 leading-relaxed text-ink-mut">
              We use premium ingredients — Madagascar vanilla, Belgian chocolate, fresh seasonal fruit — and we&apos;ll
              happily make any of our cakes eggless or Jain-friendly. No pre-mixes. No shortcuts. Just slow,
              careful baking.
            </p>
            <Link href="/menu" className="btn-accent mt-8">Explore the menu →</Link>
          </Reveal>
          <Reveal delay={0.1} className="grid grid-cols-2 gap-4">
            <div className="card relative aspect-[3/4] overflow-hidden">
              <Image src="https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&w=900&q=80" alt="Strawberry cake" fill sizes="(max-width: 768px) 45vw, 22vw" className="object-cover" />
            </div>
            <div className="card relative aspect-[3/4] overflow-hidden mt-8">
              <Image src="https://images.unsplash.com/photo-1551404973-7dec6ee9bba7?auto=format&fit=crop&w=900&q=80" alt="Red velvet cupcakes" fill sizes="(max-width: 768px) 45vw, 22vw" className="object-cover" />
            </div>
            <div className="card relative aspect-[3/4] overflow-hidden -mt-4">
              <Image src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80" alt="Chocolate chip cookies" fill sizes="(max-width: 768px) 45vw, 22vw" className="object-cover" />
            </div>
            <div className="card relative aspect-[3/4] overflow-hidden mt-4">
              <Image src="https://images.unsplash.com/photo-1569896254409-ac66c17041d2?auto=format&fit=crop&w=900&q=80" alt="Chocolate truffles" fill sizes="(max-width: 768px) 45vw, 22vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-x">
          <h2 className="t-h2 text-center">What we <span className="text-gradient">stand for</span></h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { t: "Small-batch baking", d: "We bake what we sell that day. No leftovers, no compromises." },
              { t: "Premium ingredients", d: "Belgian chocolate, French butter, Madagascar vanilla, real fruit." },
              { t: "Inclusive choices", d: "Eggless on every cake. Jain-friendly options. Sugar-conscious recipes." },
              { t: "Hand-finished", d: "Every flower, drip and pipe is done by hand — no two cakes are identical." },
              { t: "Fresh delivery", d: "Same-day delivery across Lucknow — as fresh as it left the kitchen." },
              { t: "Made with love", d: "It sounds clichéd, but you can taste it. Promise." },
            ].map((v) => (
              <div key={v.t} className="card p-6">
                <div className="t-h3">{v.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-ink-mut">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
