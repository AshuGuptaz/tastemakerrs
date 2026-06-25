import Link from "next/link";
import Image from "next/image";
import { Leaf, Truck, Camera, ShieldCheck, ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

/** Apple-style bento grid of value props. Subtle hover lift + accent glow. */
export default function Bento() {
  return (
    <section className="section">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow justify-center">Why The Taste Makerrs</span>
          <h2 className="t-h2 mt-4">Everything a celebration deserves.</h2>
          <p className="t-lead mx-auto mt-4 max-w-xl">
            Premium ingredients, dietary care, and same-day delivery — engineered into every order.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-2">
          {/* Feature — large, with image */}
          <Reveal delay={0.02} className="md:col-span-4 md:row-span-2">
            <article className="surface surface-hover group relative h-full overflow-hidden p-8">
              <div className="relative z-10 max-w-sm">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-flame/10 text-flame">
                  <Camera className="h-5 w-5" />
                </span>
                <h3 className="t-h3 mt-5">Custom photo &amp; bento cakes</h3>
                <p className="mt-2 text-ink-mut">
                  Your photo, your message, your colours — printed edible and finished by hand. Design it in minutes.
                </p>
                <Link href="/custom-cake" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-flame transition-all hover:gap-2.5">
                  Start designing <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="pointer-events-none absolute -bottom-10 -right-8 h-56 w-56 overflow-hidden rounded-[2rem] opacity-90 shadow-e3 transition-transform duration-500 ease-out group-hover:-translate-y-1 group-hover:rotate-[-2deg] md:h-64 md:w-64">
                <Image src="/images/cakes/pinata.jpg" alt="" fill sizes="256px" className="object-cover" />
              </div>
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(242,106,141,0.18),transparent_70%)] blur-xl" />
            </article>
          </Reveal>

          <Reveal delay={0.06} className="md:col-span-2">
            <article className="surface surface-hover flex h-full flex-col p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-flame/10 text-flame">
                <Leaf className="h-5 w-5" />
              </span>
              <h3 className="t-h3 mt-5">Eggless &amp; Jain-friendly</h3>
              <p className="mt-2 text-sm text-ink-mut">100% pure veg. Eggless on any cake, Jain options always available.</p>
            </article>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-2">
            <article className="surface surface-hover flex h-full flex-col p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-flame/10 text-flame">
                <Truck className="h-5 w-5" />
              </span>
              <h3 className="t-h3 mt-5">Same-day delivery</h3>
              <p className="mt-2 text-sm text-ink-mut">Sealed, temperature-controlled, and at your door the same morning.</p>
            </article>
          </Reveal>
        </div>

        {/* trust strip */}
        <Reveal delay={0.04} className="mt-4">
          <div className="surface flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-flame/10 text-flame">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <p className="text-sm text-ink-soft">
                <span className="font-semibold text-ink">FSSAI-certified kitchen</span> · audited annually · no preservatives, ever.
              </p>
            </div>
            <Link href="/kitchen" className="btn-line text-sm">Tour our kitchen</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
