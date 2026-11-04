import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBestsellers } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/ui/Reveal";

export default function Showcase() {
  const items = getBestsellers(8);
  return (
    <section className="section max-md:py-12">
      <div className="container-x">
        <Reveal className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-xl">
            <span className="t-eyebrow">Bestsellers</span>
            <h2 className="t-h2 mt-4">Baked fresh — <span className="text-gradient">most-loved</span> this week.</h2>
          </div>
          <Link href="/menu" className="btn-line group">
            Browse the full menu
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <div className="mt-8 no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 scroll-px-5 md:mx-0 md:grid md:gap-5 md:overflow-visible md:px-0 md:pb-0 md:mt-12 md:grid-cols-2 lg:grid-cols-4">
          {items.map((p, i) => (
            <div key={p.id} className="w-[72vw] max-w-[18rem] shrink-0 snap-start md:w-auto md:max-w-none">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
