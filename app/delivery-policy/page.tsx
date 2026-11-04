import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { DELIVERY_FEE, FREE_DELIVERY_ABOVE } from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Delivery, Freshness & Refunds",
  description:
    "Delivery areas and timings, freshness, eggless and allergen information, cancellations, refunds and what we do if something goes wrong.",
};

/*
 * OWNER REVIEW NEEDED: the delivery, eggless and FSSAI facts below come from the
 * site's existing FAQ / pricing. The cancellation + refund terms (sections 5–6)
 * are sensible bakery defaults — edit them to match what you actually offer.
 */
const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "delivery",
    title: "Delivery areas & timings",
    body: (
      <>
        <p>We deliver across <strong>Lucknow</strong> in sealed, temperature-controlled boxes (with ice gel packs in summer).</p>
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Same-day:</strong> most cakes and treats ordered before <strong>12 noon</strong> can be delivered the same day.</li>
          <li><strong>Custom photo cakes & large tiered cakes:</strong> please order <strong>24–48 hours</strong> ahead so we can finish them perfectly.</li>
          <li>Choose a delivery date and a time slot at checkout (9 AM – 9 PM, in 3-hour windows).</li>
          <li>Delivery fee: <strong>{formatINR(DELIVERY_FEE)}</strong>, free on orders of <strong>{formatINR(FREE_DELIVERY_ABOVE)}</strong> and above.</li>
          <li>Outside Lucknow? <a className="text-flame underline" href={whatsappLink("Hi, can you deliver to my city?")} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a> — we&apos;ll tell you what&apos;s possible.</li>
        </ul>
      </>
    ),
  },
  {
    id: "freshness",
    title: "Freshness & ingredients",
    body: (
      <p>Everything is baked fresh in small batches, to order — never from a shelf. We use premium ingredients (Madagascar vanilla, Belgian chocolate, fresh seasonal fruit) with no pre-mixes and no preservatives. Our kitchen is <strong>FSSAI-certified</strong>. For best taste, keep cakes refrigerated and bring them to room temperature about 20 minutes before serving.</p>
    ),
  },
  {
    id: "eggless",
    title: "Eggless & allergens",
    body: (
      <>
        <p>Our kitchen is <strong>100% pure vegetarian</strong>, and any cake can be made <strong>eggless on request</strong>.</p>
        <p>Our products may contain or be made near <strong>gluten, dairy, nuts and soy</strong>. If you or a guest has an allergy, please tell us before ordering so we can advise honestly — we can&apos;t guarantee a nut-free or allergen-free product.</p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changing or cancelling an order",
    body: (
      <p>Because every order is baked fresh for you, changes and cancellations are possible <strong>only until we start baking</strong> — usually a few hours before your delivery slot. Message us as early as you can and we&apos;ll do our best. Custom cakes are made to your design, so they can&apos;t be cancelled once work has begun.</p>
    ),
  },
  {
    id: "refunds",
    title: "Refunds & replacements",
    body: (
      <>
        <p>Cakes and treats are perishable, so we can&apos;t accept returns. But if something isn&apos;t right, we&apos;ll make it right:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li><strong>Damaged, wrong or missing item:</strong> send us a photo within <strong>2 hours of delivery</strong> and we&apos;ll replace it or refund you.</li>
          <li><strong>Late delivery:</strong> if we miss your slot, tell us and we&apos;ll sort it out — including a refund of the delivery fee where it&apos;s our fault.</li>
          <li><strong>Approved refunds</strong> go back to your original payment method, usually within 5–7 working days.</li>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    title: "Need help with an order?",
    body: (
      <p>The quickest way is WhatsApp — share your order number and we&apos;ll reply within 2 hours.</p>
    ),
  },
];

export default function DeliveryPolicyPage() {
  return (
    <section className="bg-canvas py-16 md:py-24">
      <article className="container-x mx-auto max-w-3xl text-ink-soft">
        <h1 className="t-h2">Delivery, freshness &amp; refunds</h1>
        <p className="t-lead mt-3">Everything you might want to know before you order.</p>

        <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
          {SECTIONS.slice(0, -1).map((s) => (
            <a key={s.id} href={`#${s.id}`} className="chip hover:border-ink/20">{s.title}</a>
          ))}
        </nav>

        <div className="mt-10 space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 space-y-3 leading-relaxed">
              <h2 className="font-display text-2xl font-semibold text-ink">{s.title}</h2>
              {s.body}
            </section>
          ))}
        </div>

        <a
          href={whatsappLink("Hi, I need help with my order")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-accent mt-8"
        >
          <MessageCircle className="h-4 w-4" /> Chat with us
        </a>
        <p className="mt-8 text-sm text-ink-mut">
          See also our <Link href="/privacy-policy" className="underline">privacy policy</Link>.
        </p>
      </article>
    </section>
  );
}
