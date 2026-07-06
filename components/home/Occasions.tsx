import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import HandDrawnCircle from "@/components/ui/HandDrawnCircle";

const OCCASIONS = [
  { title: "Birthdays", copy: "Bento, photo & pinata cakes that steal the show.", img: "/images/gallery/floral-birthday.jpg", href: "/menu?cat=cakes" },
  { title: "Weddings & anniversaries", copy: "Elegant tiers, finished to look as good as they taste.", img: "/images/gallery/wedding-cake.png", href: "/custom-cake" },
  { title: "Corporate & bulk gifting", copy: "Curated hampers & chocolate boxes with custom branding.", img: "/images/gallery/cookie-bouquet.jpg", href: "/menu?cat=hampers" },
];

export default function Occasions() {
  return (
    <section className="section">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow justify-center">For every occasion</span>
          <h2 className="t-h2 mt-4">A cake for <HandDrawnCircle className="mx-1 text-flame">every reason</HandDrawnCircle> to gather.</h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {OCCASIONS.map((o, i) => (
            <Reveal key={o.title} delay={i * 0.08}>
              <Link
                href={o.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-line shadow-e1 transition-all duration-300 hover:-translate-y-1 hover:shadow-e3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40"
              >
                <Image
                  src={o.img}
                  alt={o.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-semibold tracking-tight text-white">{o.title}</h3>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-all duration-300 group-hover:bg-flame">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-2 max-w-[16rem] text-sm leading-relaxed text-white/75">{o.copy}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
