import { MessageCircle, Clock, Sparkles, Truck, ArrowRight } from "lucide-react";
import { whatsappLink } from "@/lib/site";
import PageHeader from "@/components/ui/PageHeader";
import Reveal from "@/components/ui/Reveal";
import type { Metadata } from "next";

const PERKS = [
  { Icon: Clock, label: "Replies within 2 hours" },
  { Icon: Sparkles, label: "Custom & photo cakes" },
  { Icon: Truck, label: "Same-day delivery in Lucknow" },
];

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions about an order, a custom cake or a gift hamper? Reach The Taste Makerrs on WhatsApp, phone or email.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Say hello"
        titleSegments={[
          { text: "Let's make" },
          { text: "sweet", className: "text-gradient" },
          { text: "plans" },
        ]}
        subtitle="For custom cakes, bulk orders, weddings and corporate gifting — message us on WhatsApp and we'll be back in 2 hours."
      />

      <section className="section">
        <div className="container-x">
          <Reveal className="surface mx-auto max-w-2xl px-6 py-10 text-center shadow-e2 md:px-12 md:py-14">
            {/* pulsing chat badge */}
            <div className="relative mx-auto grid h-16 w-16 place-items-center">
              <span aria-hidden className="absolute inset-0 animate-ping rounded-2xl bg-flame/20" />
              <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-flame/10 text-flame">
                <MessageCircle className="h-8 w-8" strokeWidth={2} />
              </span>
            </div>

            <h2 className="t-h2 mt-6">
              Order in a <span className="text-gradient">single message</span>.
            </h2>
            <p className="t-lead mx-auto mt-4 max-w-md">
              Tell us the flavour, size and date you have in mind. We&apos;ll confirm the design, price and delivery
              right here on WhatsApp — no forms, no waiting.
            </p>

            <ul className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
              {PERKS.map(({ Icon, label }) => (
                <li key={label} className="chip">
                  <Icon className="h-3.5 w-3.5 text-flame" /> {label}
                </li>
              ))}
            </ul>

            {/* CTA: soft ping ring behind + shimmer sweep across */}
            <div className="relative mx-auto mt-9 w-full max-w-xs">
              <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-pill" />
              <a
                href={whatsappLink("Hi, I want to order")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-accent group relative w-full overflow-hidden !py-4 text-base"
              >
                <span
                  aria-hidden
                  className="animate-shine pointer-events-none absolute inset-0"
                  style={{ background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)", backgroundSize: "200% 100%" }}
                />
                <MessageCircle className="relative h-5 w-5 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
                <span className="relative">Chat with us</span>
                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </div>
            <p className="mt-4 text-xs text-ink-mut">Opens WhatsApp with your message ready — just tap send.</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
