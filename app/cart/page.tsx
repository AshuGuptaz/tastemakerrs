"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Underlined from "@/components/Underlined";

export default function CartPage() {
  const { items, setQty, remove, subtotal } = useCart();
  const delivery = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 79;
  const total = subtotal + delivery;

  return (
    <section className="bg-cream-50 py-16 md:py-24 min-h-[60vh]">
      <div className="container-x">
        <h1 className="display text-[clamp(2.5rem,7vw,5rem)]">Your <Underlined>cart</Underlined>.</h1>

        {items.length === 0 ? (
          <div className="card mt-10 grid place-items-center p-16 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-cream-100 text-flame"><ShoppingBag className="h-9 w-9" /></div>
            <p className="mt-4 font-display text-2xl">Your cart is empty</p>
            <p className="mt-2 text-cocoa/60">Pick something sweet to get started.</p>
            <Link href="/menu" className="btn-primary mt-6">Browse the menu</Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {items.map((it, i) => (
                <motion.div
                  key={it.id + (it.variant ?? "")}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="card flex flex-wrap items-center gap-4 p-4 md:flex-nowrap"
                >
                  <div className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-2xl bg-cream-100 text-5xl">
                    {it.image && (it.image.startsWith("/") || it.image.startsWith("http")) ? (
                      <Image src={it.image} alt={it.name} fill sizes="96px" className="object-cover" />
                    ) : (
                      it.image || "🎂"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-display text-lg uppercase">{it.name}</h3>
                    {it.variant && <p className="text-xs text-cocoa/60">{it.variant}</p>}
                    <p className="mt-1 font-display text-flame">₹{it.price}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-pill border border-cocoa/15 bg-white">
                    <button onClick={() => setQty(it.id, it.variant, it.qty - 1)} aria-label="Decrease quantity" className="grid h-10 w-10 place-items-center hover:text-flame focus-ring"><Minus className="h-4 w-4" /></button>
                    <span className="w-8 text-center font-semibold">{it.qty}</span>
                    <button onClick={() => setQty(it.id, it.variant, it.qty + 1)} aria-label="Increase quantity" className="grid h-10 w-10 place-items-center hover:text-flame focus-ring"><Plus className="h-4 w-4" /></button>
                  </div>
                  <p className="w-20 text-right font-display text-lg">₹{it.qty * it.price}</p>
                  <button onClick={() => remove(it.id, it.variant)} className="grid h-10 w-10 place-items-center rounded-pill text-cocoa/60 hover:bg-rose-500 hover:text-white focus-ring" aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            <aside className="lg:sticky lg:top-24 self-start">
              <div className="card p-6">
                <h3 className="font-display text-xl uppercase">Order Summary</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex justify-between"><span className="text-cocoa/60">Subtotal</span><span>₹{subtotal}</span></li>
                  <li className="flex justify-between"><span className="text-cocoa/60">Delivery</span><span>{delivery === 0 ? <span className="text-flame">FREE</span> : `₹${delivery}`}</span></li>
                </ul>
                {subtotal < 999 && (
                  <p className="mt-3 rounded-2xl bg-peach-100 px-4 py-3 text-xs">
                    Add <b>₹{999 - subtotal}</b> more for free delivery.
                  </p>
                )}
                <div className="mt-5 flex items-baseline justify-between border-t border-cocoa/10 pt-4">
                  <span className="font-display text-xl uppercase">Total</span>
                  <span className="font-display text-3xl text-flame">₹{total}</span>
                </div>
                <Link href="/checkout" className="btn-primary mt-5 w-full justify-center">
                  <ShoppingBag className="h-4 w-4" /> Proceed to Checkout
                </Link>
                <Link href="/menu" className="btn-ghost mt-2 w-full justify-center">Continue shopping</Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
