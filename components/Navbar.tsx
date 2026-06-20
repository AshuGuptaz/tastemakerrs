"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu as MenuIcon, X, Sparkles } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useCartUI } from "@/context/CartUIContext";

const NAV = [
  { href: "/menu", label: "Menu" },
  { href: "/custom-cake", label: "Customize" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/offers", label: "Offers" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { count } = useCart();
  const { openDrawer } = useCartUI();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-flame/10 bg-cream-50/80 backdrop-blur-xl shadow-[0_2px_24px_-4px_rgba(242,106,141,0.12)]">
      <div className="container-x flex h-16 items-center justify-between md:h-20">

        {/* Brand */}
        <Link href="/" className="group flex flex-col items-start leading-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40">
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.42em] text-flame/70 transition-colors group-hover:text-flame">
            The
          </span>
          <span className="font-display text-[1.7rem] leading-none tracking-wide text-cocoa md:text-[2rem]">
            Taste <span className="text-flame">Makerrs</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`group relative rounded-md py-1 text-sm font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 ${
                  active ? "text-flame" : "text-cocoa/70 hover:text-cocoa"
                }`}
              >
                {n.label}
                <span className="pointer-events-none absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-flame/60 transition-transform duration-300 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full bg-flame shadow-[0_0_6px_rgba(242,106,141,0.6)]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <button
            id="cart-fab"
            onClick={openDrawer}
            aria-label={`Open cart${count > 0 ? `, ${count} items` : ""}`}
            className="relative rounded-pill border border-cocoa/15 bg-white p-2.5 shadow-sm transition-all hover:border-flame/30 hover:shadow-[0_4px_14px_rgba(242,106,141,0.2)] hover:bg-flame hover:text-white"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4 }}
                animate={{ scale: [0.4, 1.35, 1] }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-flame px-1 text-xs font-bold text-white ring-2 ring-cream-50 shadow-[0_2px_8px_rgba(242,106,141,0.5)]"
              >
                {count}
              </motion.span>
            )}
          </button>

          {/* Order Now — animated */}
          <motion.div
            className="hidden md:block"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href="/menu"
              className="relative inline-flex items-center gap-2 overflow-hidden rounded-pill bg-flame px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow-[0_4px_20px_rgba(242,106,141,0.45)] transition-shadow hover:shadow-[0_6px_28px_rgba(242,106,141,0.6)]"
            >
              {/* shimmer sweep */}
              <motion.span
                className="pointer-events-none absolute inset-0 skew-x-[-20deg] bg-white/20"
                initial={{ translateX: "-100%" }}
                animate={{ translateX: ["-100%", "200%"] }}
                transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
              />
              <Sparkles className="h-3.5 w-3.5" />
              Order Now
            </Link>
          </motion.div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden rounded-pill border border-cocoa/15 bg-white p-2.5 shadow-sm"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-flame/10 bg-cream-50/95 backdrop-blur-xl"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl2 px-3 py-3 text-base font-semibold uppercase tracking-wide text-cocoa hover:bg-peach-100/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                href="/menu"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-pill bg-flame px-6 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-[0_4px_20px_rgba(242,106,141,0.4)]"
              >
                <Sparkles className="h-3.5 w-3.5" /> Order Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
