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
        titleSegments={[
          { text: "Made in a kitchen, shared with" },
          { text: "love.", className: "text-gradient" },
        ]}
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
                <div className="absolute left-1/2 top-[-30%] h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(240,167,184,0.12),transparent_65%)] blur-2xl" />
              </div>
              <div className="relative grid items-center gap-10 md:grid-cols-[0.8fr_1.2fr]">
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/v5/mark-cocoa.svg"
                    alt="The Taste Makerrs mark — a T and an m piped in icing on a cocoa cake, ringed with piped dots"
                    className="h-40 w-40 md:h-52 md:w-52"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-flame">The mark</p>
                  <h2 className="t-h2 mt-3">written in icing.</h2>
                  <p className="mt-4 leading-relaxed text-ink-soft">
                    Every celebration cake leaves our kitchen with a message piped on top. So the logo is exactly
                    that: a T and an m, piped in one continuous stroke onto a cake. The cocoa disc is the cake seen
                    from above; the ring of cream dots is the piped border every baker finishes with.
                  </p>
                </div>
              </div>

              {/* What every element indicates */}
              <div className="relative mt-12 grid gap-x-10 gap-y-7 border-t border-line pt-10 sm:grid-cols-2">
                {[
                  { t: "One continuous stroke", d: "Curl, crossbar, stem, loop, arches — the nozzle never lifts, the way a message really gets piped onto a cake." },
                  { t: "An even line", d: "The stroke never changes width, like a round piping nozzle. Our doodles and wordmark are drawn with the same line." },
                  { t: "The piped border", d: "The ring of cream dots is the finishing border every cake gets before it's boxed. It frames the mark like it frames the cake." },
                  { t: "The little heart", d: "The stroke lifts off in a flick and a small heart — the sign-off on every order, because each one is made for someone." },
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
                “say it with icing.”
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Made to be unwrapped — packaging & craft */}
      <section className="section pt-0">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] on-dark bg-cocoa px-6 py-14 md:rounded-[2.5rem] md:px-12 md:py-20">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-6%] top-[-25%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(240,167,184,0.24),transparent_62%)] blur-2xl" />
                <div className="absolute inset-0 bg-grid opacity-[0.05]" />
              </div>

              <div className="relative mx-auto max-w-2xl text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-butter">Say it with icing</p>
                <h2 className="font-display mt-3 text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.05] tracking-tight text-cream">
                  made to be <span className="text-butter">unwrapped.</span>
                </h2>
                <p className="mt-4 leading-relaxed text-cream/75">
                  Sprinkles on the lid, the piped TM on the cake, a scalloped tag with your message. Every order
                  arrives looking like the moment it was made for.
                </p>
              </div>

              <div className="relative mt-11 grid gap-4 md:grid-cols-2 md:gap-5">
                {[
                  { src: "/brand/v5/mockups/pastry-bags.jpg", label: "kraft pastry bags", alt: "Kraft pastry bags sealed with the TM roundel and pastel scalloped labels", cls: "aspect-[4/3] md:row-span-2 md:aspect-auto md:min-h-full", pos: "object-center" },
                  { src: "/brand/v5/mockups/cake-box.jpg", label: "the celebration box", alt: "Sprinkle-print cake box lid, a cake piped with the TM mark, and a scalloped gift tag", cls: "aspect-[2/1]", pos: "object-center" },
                  { src: "/brand/v5/mockups/cookie-tin.jpg", label: "the cookie tin", alt: "Blush rosette-print cookie tin sealed with the Tastemakerrs roundel beside a plate of cookies", cls: "aspect-[2/1]", pos: "object-center" },
                  { src: "/brand/v5/mockups/carrier-bags.jpg", label: "carrier bags", alt: "Cocoa, cream and kraft carrier bags with the piped TM mark and roundel", cls: "aspect-[16/10]", pos: "object-center" },
                  { src: "/brand/v5/mockups/social.jpg", label: "on instagram", alt: "Tastemakerrs Instagram feed and post templates in sprinkles, cocoa and cream", cls: "aspect-[16/10]", pos: "object-center" },
                ].map((m) => (
                  <figure key={m.label} className={`group relative overflow-hidden rounded-[1.25rem] border border-cream/10 bg-cocoa-deep ${m.cls}`}>
                    <Image
                      src={m.src}
                      alt={m.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={`object-cover ${m.pos} transition-transform duration-700 ease-out group-hover:scale-[1.04]`}
                    />
                    <figcaption className="absolute bottom-3 left-3 rounded-pill bg-cocoa/85 px-3 py-1 text-xs font-semibold text-cream backdrop-blur">
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
