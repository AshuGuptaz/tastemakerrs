"use client";

import Link from "next/link";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCartUI } from "@/context/CartUIContext";
import { formatINR } from "@/lib/format";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function CartDrawer() {
  const { items, subtotal, count, setQty, remove } = useCart();
  const { drawerOpen, closeDrawer } = useCartUI();

  return (
    <AnimatePresence>
      {drawerOpen && (
        <m.div
          className="fixed inset-0 z-[9995]"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <m.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-wine/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <m.aside
            role="dialog"
            aria-label="Shopping cart"
            variants={{ hidden: { x: "100%" }, visible: { x: 0 } }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-canvas shadow-soft"
          >
            <header className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="flex items-center gap-2 font-display text-2xl text-ink">
                <ShoppingBag className="h-5 w-5 text-flame" /> Your Cart
                <span className="text-base text-ink-mut">({count})</span>
              </h2>
              <button
                onClick={closeDrawer}
                aria-label="Close cart"
                className="rounded-pill border border-line bg-white p-2 hover:bg-flame hover:text-white transition-colors focus-ring"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-surface">
                  <ShoppingBag className="h-8 w-8 text-flame" />
                </div>
                <p className="font-display text-xl text-ink">Your cart is empty</p>
                <p className="text-sm text-ink-mut">Time to treat yourself to something sweet.</p>
                <Link href="/menu" onClick={closeDrawer} className="btn-accent mt-2">
                  Browse the menu
                </Link>
              </div>
            ) : (
              <>
                <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-4">
                  <AnimatePresence initial={false}>
                    {items.map((it) => (
                      <m.div
                        key={it.id + (it.variant ?? "")}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="flex gap-3 border-b border-line py-4"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-surface">
                          {it.image && (it.image.startsWith("/") || it.image.startsWith("http")) ? (
                            <Image src={it.image} alt={it.name} fill sizes="80px" className="object-cover" />
                          ) : (
                            <span className="grid h-full w-full place-items-center text-3xl">{it.image ?? "🎂"}</span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display text-base leading-tight text-ink">{it.name}</h3>
                            <button
                              onClick={() => remove(it.id, it.variant)}
                              aria-label={`Remove ${it.name}`}
                              className="text-ink-mut hover:text-flame transition-colors focus-ring"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {it.variant && <p className="text-xs text-ink-mut">{it.variant}</p>}
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1 rounded-pill border border-line bg-white">
                              <button
                                onClick={() => setQty(it.id, it.variant, it.qty - 1)}
                                aria-label="Decrease quantity"
                                className="grid h-8 w-8 place-items-center rounded-pill hover:text-flame focus-ring"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold">{it.qty}</span>
                              <button
                                onClick={() => setQty(it.id, it.variant, it.qty + 1)}
                                aria-label="Increase quantity"
                                className="grid h-8 w-8 place-items-center rounded-pill hover:text-flame focus-ring"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="font-display text-lg text-flame-700">{formatINR(it.price * it.qty)}</span>
                          </div>
                        </div>
                      </m.div>
                    ))}
                  </AnimatePresence>
                </div>

                <footer className="border-t border-line px-6 py-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm uppercase tracking-wider text-ink-mut">Subtotal</span>
                    <span className="font-display text-2xl text-ink">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/cart" onClick={closeDrawer} className="btn-line flex-1 justify-center">
                      View cart
                    </Link>
                    <Link href="/checkout" onClick={closeDrawer} className="btn-accent flex-1 justify-center">
                      Checkout
                    </Link>
                  </div>
                </footer>
              </>
            )}
          </m.aside>
        </m.div>
      )}
    </AnimatePresence>
  );
}
