import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that apply when you order from The Taste Makerrs: orders, pricing, payments, custom cakes, delivery, cancellations and liability.",
};

/*
 * OWNER REVIEW NEEDED: these are sensible bakery defaults, written to match the
 * delivery/refund policy. Have them reviewed (ideally by a lawyer) before relying on them.
 */
const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "using-the-site",
    title: "Using this website",
    body: (
      <p>By browsing or placing an order on thetastemakerrs.com you agree to these terms. If you don&apos;t agree, please don&apos;t use the site. We may update these terms from time to time; the version on this page applies to orders placed after it is published.</p>
    ),
  },
  {
    id: "orders",
    title: "Orders & verification",
    body: (
      <>
        <p>An order is confirmed only once payment succeeds and you see the order confirmation. We may verify your phone number or email with a one-time code before checkout.</p>
        <p>Please give an accurate delivery address, contact number and a reachable recipient. We can&apos;t be responsible for failed delivery caused by incorrect details or an unreachable recipient.</p>
      </>
    ),
  },
  {
    id: "pricing",
    title: "Pricing & payment",
    body: (
      <>
        <p>All prices are in Indian Rupees (₹) and include applicable taxes unless stated otherwise. The total shown at checkout (items, delivery fee and any coupon) is the amount you are charged.</p>
        <p>Payments are processed securely by Razorpay or Stripe. We never see or store your card or UPI details. Coupons are single-use per order, cannot be combined unless stated, and may carry minimum-order, first-order or expiry conditions.</p>
        <p>If a price is shown incorrectly we may cancel the order and refund you in full.</p>
      </>
    ),
  },
  {
    id: "custom-cakes",
    title: "Custom & photo cakes",
    body: (
      <p>Custom cakes are made to your brief, so we need your design details and at least 24–48 hours&apos; notice. We follow your reference as closely as possible, but hand-finished work may differ slightly in colour, shape or decoration. Custom cakes can&apos;t be cancelled once work has begun.</p>
    ),
  },
  {
    id: "delivery",
    title: "Delivery, freshness & allergens",
    body: (
      <>
        <p>Delivery windows are estimates and we aim to hit them, but traffic, weather or events beyond our control can cause delays. Perishable items should be refrigerated on arrival and consumed as advised.</p>
        <p>Our products may contain or be made near gluten, dairy, nuts and soy. We can&apos;t guarantee any product is free of an allergen; please tell us about allergies before ordering. Full details are on our <Link href="/delivery-policy" className="text-flame underline">delivery &amp; refunds</Link> page.</p>
      </>
    ),
  },
  {
    id: "cancellations",
    title: "Cancellations, refunds & replacements",
    body: (
      <p>Because everything is baked fresh to order, we can&apos;t accept returns. Cancellations are possible only until we start baking, and refunds or replacements for damaged, wrong or missing items are handled as described in our <Link href="/delivery-policy#refunds" className="text-flame underline">refund policy</Link>. Approved refunds go to your original payment method, usually within 5–7 working days.</p>
    ),
  },
  {
    id: "accounts-reviews",
    title: "Accounts & reviews",
    body: (
      <p>Accounts are passwordless and tied to a phone number or email you&apos;ve verified; you&apos;re responsible for activity on your account. Reviews must come from genuine purchases, be honest and respectful, and may be moderated or removed. By posting a review or photo you let us display it on our site and marketing.</p>
    ),
  },
  {
    id: "liability",
    title: "Liability",
    body: (
      <p>We take care with every order, but to the extent permitted by law our liability for any claim relating to an order is limited to the amount you paid for that order. Nothing in these terms limits rights you have under Indian consumer law.</p>
    ),
  },
  {
    id: "law",
    title: "Governing law & contact",
    body: (
      <p>These terms are governed by the laws of India, with courts at Lucknow having jurisdiction. Questions? Reach us via the <Link href="/contact" className="text-flame underline">contact page</Link> or WhatsApp.</p>
    ),
  },
];

export default function TermsPage() {
  return (
    <section className="bg-canvas py-16 md:py-24">
      <article className="container-x mx-auto max-w-3xl text-ink-soft">
        <h1 className="t-h2">Terms &amp; conditions</h1>
        <p className="t-lead mt-3">The ground rules for ordering from The Taste Makerrs.</p>

        <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
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
          href={whatsappLink("Hi, I have a question about your terms")}
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
