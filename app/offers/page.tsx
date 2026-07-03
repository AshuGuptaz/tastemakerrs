import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import CouponCodeChip from "@/components/CouponCodeChip";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Offers",
  description: "Active offers and combos at The Taste Makerrs.",
};

type Offer = {
  t: string;
  desc: string;
  bg: string;
  img: string;
  code?: string; // present → copyable code that works at checkout
  note?: string; // present → how to redeem (no checkout code)
};

// NOTE: `code` values here must stay in sync with the coupon map in
// app/checkout/page.tsx. Offers without a checkout code are redeemed manually.
const OFFERS: Offer[] = [
  { t: "First Bite",  desc: "10% off your first order",        code: "FIRSTBITE", bg: "bg-peach-100",  img: "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&w=900&q=80" },
  { t: "Birthday",    desc: "₹150 off birthday cakes ≥ ₹999",  code: "BDAY150",   bg: "bg-cream-200",  img: "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?auto=format&fit=crop&w=900&q=80" },
  { t: "Hamper Love", desc: "20% off any hamper",              code: "HAMPER20",  bg: "bg-sky-100",    img: "https://images.unsplash.com/photo-1687795097254-f019f9d7fd17?auto=format&fit=crop&w=900&q=80" },
  { t: "Bulk Treats", desc: "10% off orders ≥ ₹3,000",         code: "BULK10",    bg: "bg-peach-200",  img: "https://images.unsplash.com/photo-1569896254409-ac66c17041d2?auto=format&fit=crop&w=900&q=80" },
  { t: "Jain Plus",   desc: "Jain-friendly options on every cake", note: "Just choose “Jain-friendly” on the Customize page — available on any cake.", bg: "bg-cream-100", img: "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&w=900&q=80" },
  { t: "Sweet Combo", desc: "Cake + 6 cupcakes for ₹999",      note: "Add both to your cart and mention “Sweet Combo” in your delivery notes.", bg: "bg-cocoa-50", img: "https://images.unsplash.com/photo-1551404973-7dec6ee9bba7?auto=format&fit=crop&w=900&q=80" },
];

export default function OffersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sweet deals"
        title={<>Offers you <span className="text-gradient">can&apos;t resist</span>.</>}
        subtitle="Copy a code and paste it at checkout — one code per order."
      />

      <section className="section bg-canvas">
        <div className="container-x grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((o) => (
            <div key={o.t} className="card flex flex-col overflow-hidden">
              <div className={`relative aspect-[4/3] overflow-hidden ${o.bg}`}>
                <Image src={o.img} alt={o.t} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-wine/20 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-2xl">{o.t}</h3>
                <p className="mt-1 text-ink-mut">{o.desc}</p>

                {o.code ? (
                  <CouponCodeChip code={o.code} />
                ) : (
                  <p className="mt-4 rounded-2xl bg-surface px-4 py-2.5 text-xs text-ink-mut">
                    {o.note}
                  </p>
                )}

                <Link href="/menu" className="btn-accent mt-5 w-full justify-center">Shop now</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
