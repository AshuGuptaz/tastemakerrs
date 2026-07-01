import { ShieldCheck, Star, Lock, Truck } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const ITEMS = [
  { Icon: ShieldCheck, label: "FSSAI-certified kitchen" },
  { Icon: Lock, label: "Secure checkout" },
  { Icon: Truck, label: "Same-day delivery" },
];

export default function TrustStrip() {
  return (
    <section className="pb-4 pt-10">
      <div className="container-x">
        <Reveal className="flex flex-col items-center gap-5 text-center">
          {/* Rating — moved up out of the hero */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-sm text-ink-mut">
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-[18px] w-[18px] fill-flame text-flame" />
              ))}
            </span>
            <span className="font-semibold text-ink">4.9</span>
            <span className="text-ink-mut/50">·</span>
            <span>2,000+ cakes baked &amp; loved across Lucknow</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
            {ITEMS.map(({ Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft">
                <Icon className="h-[18px] w-[18px] text-flame" /> {label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
