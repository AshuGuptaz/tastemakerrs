import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How The Taste Makerrs collects, uses and protects your data.",
};

export default function PrivacyPage() {
  return (
    <section className="bg-canvas py-16 md:py-24">
      <article className="container-x mx-auto max-w-3xl space-y-4 text-ink-soft">
        <h1 className="font-display font-semibold uppercase leading-[0.98] tracking-tight text-ink text-[clamp(2rem,5vw,3.5rem)]">PRIVACY POLICY</h1>
        <p className="mt-2 text-sm text-ink-mut">Last updated: June 2026</p>

        <h2 className="mt-8 font-display text-2xl uppercase">1. Who we are</h2>
        <p>The Taste Makerrs (“we”, “us”, “our”) is a small-batch bakery operating in India. This policy explains how we handle your information when you use thetastemakerrs.com.</p>

        <h2 className="mt-6 font-display text-2xl uppercase">2. Information we collect</h2>
        <ul className="list-disc pl-6">
          <li>Account & order info: name, email, phone, delivery address.</li>
          <li>Payment info: handled by Razorpay/Stripe — we never store full card details.</li>
          <li>Custom cake uploads: image references you share for personalization.</li>
          <li>Usage data: cookies, basic analytics for site performance.</li>
        </ul>

        <h2 className="mt-6 font-display text-2xl uppercase">3. How we use it</h2>
        <ul className="list-disc pl-6">
          <li>Fulfil your order, deliver products and provide customer support.</li>
          <li>Send order updates and (with consent) offers and seasonal menus.</li>
          <li>Improve the site, prevent fraud, comply with legal obligations.</li>
        </ul>

        <h2 className="mt-6 font-display text-2xl uppercase">4. Sharing</h2>
        <p>We share data only with delivery partners, payment processors and analytics providers — strictly to fulfill your order. We do not sell your data.</p>

        <h2 className="mt-6 font-display text-2xl uppercase">5. Your rights</h2>
        <p>You can ask for a copy, correction or deletion of your data anytime by writing to <a href="mailto:tastemakerrs@gmail.com" className="text-flame underline">tastemakerrs@gmail.com</a>.</p>

        <h2 className="mt-6 font-display text-2xl uppercase">6. Cookies</h2>
        <p>We use a small set of essential and analytics cookies. You can disable cookies in your browser without affecting checkout.</p>

        <h2 className="mt-6 font-display text-2xl uppercase">7. Contact</h2>
        <p>Questions? <a href="mailto:tastemakerrs@gmail.com" className="text-flame underline">tastemakerrs@gmail.com</a> · +91 88816 61177.</p>
      </article>
    </section>
  );
}
