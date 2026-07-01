import Link from "next/link";
import { Check } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

type Pkg = {
  name: string;
  price: string;
  serves: string;
  features: string[];
  popular?: boolean;
};

const PACKAGES: Pkg[] = [
  {
    name: "Petite",
    price: "₹699",
    serves: "Serves 8–10",
    features: [
      "500g custom celebration cake",
      "Choice of 2 flavours",
      "Smooth buttercream finish",
      "Personalised message topper",
      "Eggless on request",
    ],
  },
  {
    name: "Signature",
    price: "₹1,499",
    serves: "Serves 20–25",
    popular: true,
    features: [
      "1kg custom cake, any shape",
      "Choice of 4 premium flavours",
      "Designer finish + edible photo print",
      "Box of 6 matching cupcakes",
      "Jain-friendly option",
      "Priority same-day delivery",
      "Complimentary cake stand",
    ],
  },
  {
    name: "Grand",
    price: "₹2,999",
    serves: "Serves 40+",
    features: [
      "2kg multi-tier showstopper",
      "Unlimited flavour combinations",
      "Luxury finish & sugar art",
      "1:1 design consultation",
      "12 cupcakes + 2 dessert jars",
      "White-glove delivery & setup",
    ],
  },
];

export default function Packages() {
  return (
    <section className="section">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow justify-center">Celebration packages</span>
          <h2 className="t-h2 mt-4">Pick a <span className="text-gradient">package</span>, leave the rest to us.</h2>
          <p className="t-lead mx-auto mt-4 max-w-xl">
            Curated bundles for every occasion — or fully customise your own. Every package is baked fresh and delivered same-day.
          </p>
        </Reveal>

        <div className="mt-14 grid items-start gap-6 md:grid-cols-3">
          {PACKAGES.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <div
                className={`relative flex h-full flex-col transition-all duration-300 ${
                  p.popular
                    ? "rounded-[2rem] border-2 border-flame bg-wheat-50 p-8 shadow-e3 ring-4 ring-flame/10 hover:-translate-y-1"
                    : "rounded-[1.5rem] border border-line bg-surface p-8 shadow-e1 hover:-translate-y-1 hover:shadow-e3"
                }`}
              >
                {p.popular && (
                  <span className="absolute left-1/2 top-5 h-1.5 w-12 -translate-x-1/2 rounded-full bg-ink/15" />
                )}
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-pill bg-flame px-4 py-1 text-xs font-semibold text-white shadow-glow">
                    Most popular
                  </span>
                )}
                <div className="text-center">
                  <h3 className="t-h3">{p.name}</h3>
                  <div className="price mt-3">{p.price}</div>
                  <p className="mt-1 text-sm text-ink-mut">{p.serves}</p>
                </div>

                <Link href="/custom-cake" className="btn-ink mt-7 w-full">
                  Order this package
                </Link>

                <ul className="mt-7 space-y-3.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-flame/10">
                        <Check className="h-3.5 w-3.5 text-flame" strokeWidth={3} />
                      </span>
                      <span className="text-sm leading-relaxed text-ink-soft">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
