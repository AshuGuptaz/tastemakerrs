import { ShieldCheck, Star, Lock, Truck } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const ITEMS = [
  { Icon: ShieldCheck, label: "FSSAI-certified kitchen" },
  { Icon: Star, label: "4.9★ on Google" },
  { Icon: Lock, label: "Secure checkout" },
  { Icon: Truck, label: "Same-day delivery" },
];

export default function TrustStrip() {
  return (
    <section className="pb-4 pt-10">
      <div className="container-x">
        <Reveal className="text-center">
          <p className="t-eyebrow justify-center">Trusted by 2,000+ celebrations across the city</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-12">
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
