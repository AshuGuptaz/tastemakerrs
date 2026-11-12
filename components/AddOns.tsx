"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { CartToast } from "@/components/ui/CartToast";
import { suggestAddOns } from "@/lib/upsell";
import { FREE_DELIVERY_ABOVE } from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { trackAddToCart } from "@/lib/analytics";

/**
 * "Complete your order" strip for the cart. Suggestions are real catalog items
 * (server reprices them), nudged toward free delivery when the cart is close.
 */
export default function AddOns() {
  const { items, subtotal, add } = useCart();
  const picks = suggestAddOns(items.map((i) => i.id), subtotal, 3);
  if (picks.length === 0) return null;

  const gap = FREE_DELIVERY_ABOVE - subtotal;

  return (
    <section aria-labelledby="addons-h" className="mt-2">
      <h2 id="addons-h" className="t-h3">Complete your order</h2>
      <p className="mt-1 text-sm text-ink-mut">
        {gap > 0 ? <>Add <b>{formatINR(gap)}</b> more to unlock free delivery.</> : "Goes beautifully with what you picked."}
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {picks.map((p) => (
          <li key={p.id} className="card flex flex-col p-3">
            <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-xl bg-surface text-3xl">
              {p.image.startsWith("/") || p.image.startsWith("http") ? (
                <Image src={p.image} alt="" fill sizes="(min-width:640px) 160px, 50vw" className="object-cover" />
              ) : (
                p.image
              )}
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-semibold text-ink">{p.name}</p>
            <div className="mt-auto flex items-center justify-between pt-2">
              <span className="font-display text-flame-700">{formatINR(p.price)}</span>
              <button
                type="button"
                aria-label={`Add ${p.name} to cart`}
                onClick={() => {
                  add({ id: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image });
                  trackAddToCart({ id: p.id, name: p.name, price: p.price });
                  toast.custom(
                    (t) => <CartToast name={p.name} image={p.image} visible={t.visible} />,
                    { duration: 2400, position: "top-right" }
                  );
                }}
                className="grid h-11 w-11 place-items-center rounded-pill bg-flame text-white transition hover:bg-flame-700 focus-ring"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
