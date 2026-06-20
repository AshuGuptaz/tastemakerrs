"use client";

import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCartUI } from "@/context/CartUIContext";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function CartDrawer() {
  const { items, subtotal, count, setQty, remove } = useCart();
  const { drawerOpen, closeDrawer } = useCartUI();

  return (
    <AnimatePresence>
      {drawerOpen && (
        <motion.div
          className="fixed inset-0 z-[9995]"
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: 0.3 }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-wine/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            role="dialog"
            aria-label="Shopping cart"
            variants={{ hidden: { x: "100%" }, visible: { x: 0 } }}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream-50 shadow-soft"
          >
            <header className="flex items-center justify-between border-b border-cocoa/10 px-6 py-5">
              <h2 className="flex items-center gap-2 font-display text-2xl text-cocoa">
                <ShoppingBag className="h-5 w-5 text-flame" /> Your Cart
                <span className="text-base text-cocoa/50">({count})</span>
              </h2>
              <button
                onClick={closeDrawer}
                aria-label="Close cart"
                className="rounded-pill border border-cocoa/15 bg-white p-2 hover:bg-flame hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-peach-100">
                  <ShoppingBag className="h-8 w-8 text-flame" />
                </div>
                <p className="font-display text-xl text-cocoa">Your cart is empty</p>
                <p className="text-sm text-cocoa/60">Time to treat yourself to something sweet.</p>
                <Link href="/menu" onClick={closeDrawer} className="btn-primary mt-2">
                  Browse the menu
                </Link>
              </div>
            ) : (
              <>
                <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-4">
                  <AnimatePresence initial={false}>
                    {items.map((it) => (
                      <motion.div
                        key={it.id + (it.variant ?? "")}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, x: 40 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="flex gap-3 border-b border-cocoa/10 py-4"
                      >
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                          {it.image && (it.image.startsWith("/") || it.image.startsWith("http")) ? (
                            <Image src={it.image} alt={it.name} fill sizes="80px" className="object-cover" />
                          ) : (
                            <span className="grid h-full w-full place-items-center text-3xl">{it.image ?? "🎂"}</span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display text-base leading-tight text-cocoa">{it.name}</h3>
                            <button
                              onClick={() => remove(it.id)}
                              aria-label={`Remove ${it.name}`}
                              className="text-cocoa/40 hover:text-flame transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          {it.variant && <p className="text-xs text-cocoa/50">{it.variant}</p>}
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center gap-1 rounded-pill border border-cocoa/15 bg-white">
                              <button
                                onClick={() => setQty(it.id, it.qty - 1)}
                                aria-label="Decrease quantity"
                                className="grid h-8 w-8 place-items-center rounded-pill hover:text-flame"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-semibold">{it.qty}</span>
                              <button
                                onClick={() => setQty(it.id, it.qty + 1)}
                                aria-label="Increase quantity"
                                className="grid h-8 w-8 place-items-center rounded-pill hover:text-flame"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="font-display text-lg text-flame">₹{it.price * it.qty}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <footer className="border-t border-cocoa/10 px-6 py-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm uppercase tracking-wider text-cocoa/60">Subtotal</span>
                    <span className="font-display text-2xl text-cocoa">₹{subtotal}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/cart" onClick={closeDrawer} className="btn-ghost flex-1 justify-center">
                      View cart
                    </Link>
                    <Link href="/checkout" onClick={closeDrawer} className="btn-primary flex-1 justify-center">
                      Checkout
                    </Link>
                  </div>
                </footer>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
