"use client";

import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Underlined from "@/components/Underlined";
import { formatINR } from "@/lib/format";

export default function CartPage() {
  const { items, setQty, remove, subtotal, hydrated } = useCart();
  const delivery = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 79;
  const total = subtotal + delivery;

  // Avoid flashing the empty-cart state before localStorage rehydrates.
  if (!hydrated) {
    return (
      <section className="bg-transparent py-16 md:py-24 min-h-[60vh]">
        <div className="container-x">
          <div className="skeleton h-14 w-60 rounded-xl" />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">{[0, 1].map((i) => <div key={i} className="skeleton h-28 rounded-[1.5rem]" />)}</div>
            <div className="skeleton h-72 rounded-[1.5rem]" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-transparent py-16 md:py-24 min-h-[60vh]">
      <div className="container-x">
        <h1 className="t-h2 text-[clamp(2.5rem,7vw,5rem)]">Your <Underlined>cart</Underlined>.</h1>

        {items.length === 0 ? (
          <div className="card mt-10 grid place-items-center p-16 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-surface text-flame"><ShoppingBag className="h-9 w-9" /></div>
            <p className="mt-4 t-h3">Your cart is empty</p>
            <p className="mt-2 text-ink-mut">Pick something sweet to get started.</p>
            <Link href="/menu" className="btn-accent mt-6">Browse the menu</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {items.map((it, i) => (
                <m.div
                  key={it.id + (it.variant ?? "")}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card grid grid-cols-[5.5rem_1fr] items-center gap-x-4 gap-y-3 p-4 md:flex md:flex-nowrap md:gap-4"
                >
                  <div className="relative grid h-[5.5rem] w-[5.5rem] place-items-center overflow-hidden rounded-2xl bg-surface text-4xl md:h-24 md:w-24 md:text-5xl">
                    {it.image && (it.image.startsWith("/") || it.image.startsWith("http")) ? (
                      <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" />
                    ) : (
                      it.image || "🎂"
                    )}
                  </div>
                  <div className="min-w-0 md:flex-1">
                    <h3 className="line-clamp-2 text-base font-semibold text-ink md:truncate">{it.name}</h3>
                    {it.variant && <p className="text-xs text-ink-mut">{it.variant}</p>}
                    <p className="mt-1 font-display text-flame-700">{formatINR(it.price)}</p>
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-3 md:contents">
                    <div className="flex items-center gap-1 rounded-pill border border-line bg-white">
                      <button onClick={() => setQty(it.id, it.variant, it.qty - 1)} disabled={it.qty <= 1} aria-label="Decrease quantity" className="grid h-11 w-11 place-items-center rounded-pill hover:text-flame focus-ring disabled:opacity-40 disabled:hover:text-current"><Minus className="h-4 w-4" /></button>
                      <span className="w-8 text-center font-semibold">{it.qty}</span>
                      <button onClick={() => setQty(it.id, it.variant, it.qty + 1)} aria-label="Increase quantity" className="grid h-11 w-11 place-items-center rounded-pill hover:text-flame focus-ring"><Plus className="h-4 w-4" /></button>
                    </div>
                    <p className="font-display text-lg md:w-20 md:text-right">{formatINR(it.qty * it.price)}</p>
                    <button onClick={() => remove(it.id, it.variant)} className="grid h-11 w-11 place-items-center rounded-pill text-ink-mut transition-colors hover:bg-red-50 hover:text-red-600 focus-ring" aria-label={`Remove ${it.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </m.div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-24 self-start">
              <div className="card p-6">
                <h3 className="t-h3">Order Summary</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex justify-between"><span className="text-ink-mut">Subtotal</span><span>{formatINR(subtotal)}</span></li>
                  <li className="flex justify-between"><span className="text-ink-mut">Delivery</span><span>{delivery === 0 ? <span className="text-flame-700">FREE</span> : formatINR(delivery)}</span></li>
                </ul>
                {subtotal < 999 && (
                  <p className="mt-3 rounded-2xl bg-surface px-4 py-3 text-xs">
                    Add <b>{formatINR(999 - subtotal)}</b> more for free delivery.
                  </p>
                )}
                <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
                  <span className="t-h3">Total</span>
                  <span className="font-display text-3xl text-flame-700">{formatINR(total)}</span>
                </div>
                <Link href="/checkout" className="btn-accent mt-5 w-full justify-center">
                  <ShoppingBag className="h-4 w-4" /> Proceed to Checkout
                </Link>
                <Link href="/menu" className="btn-line mt-2 w-full justify-center">Continue shopping</Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
