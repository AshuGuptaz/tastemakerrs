"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const IMG = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=720&q=80`;

// ── Swap these for your own photos later (verified-loading placeholders).
const CAKES = [
  { img: IMG("1497051788611-2c64812349fa"), name: "Classic Vanilla", note: "Madagascar vanilla · buttercream" },
  { img: IMG("1551404973-7dec6ee9bba7"), name: "Red Velvet", note: "Cream-cheese frost" },
  { img: IMG("1564844536308-75c540dbf14e"), name: "Belgian Chocolate", note: "70% dark ganache" },
  { img: IMG("1526081347589-7fa3cb41b4b2"), name: "Rasmalai Fusion", note: "Saffron · cardamom · pistachio" },
  { img: IMG("1659549591823-c6efec55b82f"), name: "Pistachio Rose", note: "Roasted pistachio · rose" },
  { img: IMG("1559553156-2e97137af16f"), name: "Berry Gâteau", note: "Fresh seasonal berries" },
  { img: IMG("1569896254409-ac66c17041d2"), name: "Hazelnut Praline", note: "Toasted hazelnut crunch" },
  { img: IMG("1639678114429-a915fdb55000"), name: "Lotus Biscoff", note: "Caramelised cookie butter" },
];

export default function SignatureGallery() {
  const railRef = useRef<HTMLDivElement>(null);

  // Native smooth scroll — buttery, works with trackpad/touch/arrows, never janks.
  const nudge = (dir: 1 | -1) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 560), behavior: "smooth" });
  };

  return (
    <section className="section overflow-hidden">
      <div className="container-x flex flex-wrap items-end justify-between gap-4">
        <Reveal className="max-w-2xl">
          <span className="t-eyebrow">Signature flavours</span>
          <h2 className="t-h2 mt-4">A flavour for every <span className="text-gradient">craving</span>.</h2>
          <p className="t-lead mt-4 max-w-xl">The cakes our regulars keep coming back for — each one baked to order, never from a shelf.</p>
        </Reveal>
        <div className="hidden gap-2 md:flex">
          <button onClick={() => nudge(-1)} aria-label="Previous cakes" className="grid h-11 w-11 place-items-center rounded-pill border border-line bg-surface text-ink shadow-e1 transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button onClick={() => nudge(1)} aria-label="More cakes" className="grid h-11 w-11 place-items-center rounded-pill border border-line bg-surface text-ink shadow-e1 transition-all hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative mt-10">
        {/* edge fades */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent md:w-12" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent md:w-12" />

        <div
          ref={railRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-3 md:px-8"
        >
          {CAKES.map((c) => (
            <article
              key={c.name}
              className="group relative aspect-[3/4] w-[14.5rem] shrink-0 snap-start overflow-hidden rounded-[1.75rem] border border-line bg-cream-100 shadow-e2 sm:w-[17rem]"
            >
              <Image
                src={c.img}
                alt={c.name}
                fill
                sizes="(max-width: 640px) 58vw, 17rem"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="font-display text-xl font-semibold tracking-tight">{c.name}</h3>
                <p className="mt-0.5 text-sm text-white/75">{c.note}</p>
              </div>
            </article>
          ))}

          {/* tail CTA card */}
          <Link
            href="/menu"
            className="group flex aspect-[3/4] w-[14.5rem] shrink-0 snap-start flex-col items-start justify-end rounded-[1.75rem] border border-flame/30 bg-gradient-to-br from-flame/10 to-peach-100 p-5 shadow-e1 transition-all hover:-translate-y-1 hover:shadow-e3 sm:w-[17rem]"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-flame text-white shadow-glow transition-transform duration-300 group-hover:-translate-y-1">
              <ArrowRight className="h-5 w-5" />
            </span>
            <h3 className="mt-4 t-h3">See the full menu</h3>
            <p className="mt-1 text-sm text-ink-mut">40+ flavours, eggless &amp; Jain options.</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
