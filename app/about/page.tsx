import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CTABanner from "@/components/CTABanner";
import Underlined from "@/components/Underlined";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind The Taste Makerrs — small-batch bakery, premium ingredients, eggless and Jain-friendly options.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-cream-100 py-20 md:py-28">
        <div className="container-x grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="pill mb-4">Our Story</p>
            <h1 className="display text-[clamp(2.6rem,7vw,5.5rem)]">
              Made in a kitchen, <br /> shared with <Underlined>love</Underlined>.
            </h1>
            <p className="mt-6 text-lg text-cocoa/75">
              The Taste Makerrs began with a simple idea: a cake should taste as good as it looks. We're a small-batch
              home bakery where every layer is whisked, every buttercream piped, and every box packed by hand.
            </p>
            <p className="mt-4 text-cocoa/75">
              We use premium ingredients — Madagascar vanilla, Belgian chocolate, fresh seasonal fruit — and we'll
              happily make any of our cakes eggless or Jain-friendly. No pre-mixes. No shortcuts. Just slow,
              careful baking.
            </p>
            <Link href="/menu" className="btn-primary mt-8">Explore the menu →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>
      </section>

      <section className="section bg-cream-50">
        <div className="container-x">
          <h2 className="h-section text-center">What we <Underlined>stand for</Underlined></h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { t: "Small-batch baking", d: "We bake what we sell that day. No leftovers, no compromises." },
              { t: "Premium ingredients", d: "Belgian chocolate, French butter, Madagascar vanilla, real fruit." },
              { t: "Inclusive choices", d: "Eggless on every cake. Jain-friendly options. Sugar-conscious recipes." },
              { t: "Hand-finished", d: "Every flower, drip and pipe is done by hand — no two cakes are identical." },
              { t: "Fresh delivery", d: "Same-day delivery in Mumbai/Pune. Pan-India for hampers and cookies." },
              { t: "Made with love", d: "It sounds clichéd, but you can taste it. Promise." },
            ].map((v) => (
              <div key={v.t} className="card p-6">
                <div className="font-display text-xl">{v.t}</div>
                <p className="mt-2 text-sm text-cocoa/70">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
