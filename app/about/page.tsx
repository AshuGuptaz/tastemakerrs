import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CTABanner from "@/components/CTABanner";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About",
  description: "The story behind The Taste Makerrs — small-batch bakery, premium ingredients, eggless options.",
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
              happily make any of our cakes eggless. No pre-mixes. No shortcuts. Just slow,
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

      {/* The mark & its meaning */}
      <section className="section pt-0">
        <div className="container-x">
          <Reveal>
            <div className="card relative overflow-hidden px-6 py-12 md:px-16 md:py-16">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-[-30%] h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(214,122,71,0.12),transparent_65%)] blur-2xl" />
              </div>
              <div className="relative grid items-center gap-10 md:grid-cols-[0.8fr_1.2fr]">
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/mark-line-full.svg"
                    alt="The Taste Makerrs logo mark — a two-tier cake with a single lit candle"
                    className="h-40 w-40 md:h-52 md:w-52"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-flame">The mark</p>
                  <h2 className="t-h2 mt-3">A cake for your <span className="text-gradient">favourite memories</span></h2>
                  <p className="mt-4 leading-relaxed text-ink-soft">
                    That line is the whole brand — so our logo simply <em>is</em> that cake: a hand-finished two-tier
                    celebration cake with a single lit candle. It&apos;s the product, the occasion, and the feeling,
                    all in one small, warm mark. We avoided a generic badge or a plain monogram — a bakery this
                    personal deserved a symbol you <em>feel</em> something about.
                  </p>
                </div>
              </div>

              {/* What every element indicates */}
              <div className="relative mt-12 grid gap-x-10 gap-y-7 border-t border-line pt-10 sm:grid-cols-2">
                {[
                  { t: "The two tiers", d: "Celebration & small-batch craft. A single layer is everyday; a tiered cake is made for a moment — occasion-worthy, made to order." },
                  { t: "The single flame", d: "The memory itself — a wish, a birthday, an anniversary. It's the one spot of terracotta in the whole system, so the warmth is literally the focal point." },
                  { t: "The hand-piped drips", d: "The soft, slightly irregular scallops are the trace of a human hand finishing each cake. No two are exactly alike." },
                  { t: "The terracotta full-stop", d: "A quiet signature of confidence. A period says this is complete, and we stand behind it — in the brand's ember colour." },
                ].map((el) => (
                  <div key={el.t} className="flex gap-3">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-flame" />
                    <div>
                      <h3 className="font-display text-lg text-ink">{el.t}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-mut">{el.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="relative mt-11 text-center font-display text-2xl italic text-flame-700 md:text-3xl">
                “A single candle. On everything worth remembering.”
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Made to be unwrapped — packaging & craft */}
      <section className="section pt-0">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 md:rounded-[2.5rem] md:px-12 md:py-20">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-6%] top-[-25%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(214,122,71,0.24),transparent_62%)] blur-2xl" />
                <div className="absolute inset-0 bg-grid opacity-[0.05]" />
              </div>

              <div className="relative mx-auto max-w-2xl text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-flame-400">One warm light</p>
                <h2 className="font-display mt-3 text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.05] tracking-tighter2 text-white">
                  Made to be <span className="italic text-flame-400">unwrapped</span>
                </h2>
                <p className="mt-4 leading-relaxed text-white/65">
                  Warm minimalism, end to end — a cream box, an ember ribbon, a hand-tied tag. Every order arrives
                  looking like the moment it was made for.
                </p>
              </div>

              <div className="relative mt-11 grid gap-5 md:grid-cols-3">
                {[
                  { src: "/brand/mockups/packaging_box.png", label: "The signature box" },
                  { src: "/brand/mockups/hang_tag.png", label: "A hand-tied tag" },
                  { src: "/brand/mockups/signage.png", label: "The storefront" },
                ].map((m) => (
                  <figure key={m.label} className="group overflow-hidden rounded-[1.25rem] border border-white/10 bg-black/20">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={m.src}
                        alt={m.label}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                    <figcaption className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                      {m.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
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
              { t: "Inclusive choices", d: "Eggless on every cake. Sugar-conscious recipes." },
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
