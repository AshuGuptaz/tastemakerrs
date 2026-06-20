"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu as MenuIcon, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-cocoa/10 bg-cream-50/85 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between md:h-20">
        {/* Brand mark — refined Fraunces logotype */}
        <Link href="/" className="group flex flex-col items-start leading-none">
          <span className="text-[0.58rem] font-semibold uppercase tracking-[0.42em] text-flame/80 transition-colors group-hover:text-flame">
            The
          </span>
          <span className="font-display text-[1.7rem] leading-none tracking-wide text-cocoa md:text-[2rem]">
            Taste <span className="text-flame">Makerrs</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`group relative py-1 text-sm font-semibold uppercase tracking-wide transition-colors ${
                  active ? "text-flame" : "text-cocoa/80 hover:text-cocoa"
                }`}
              >
                {n.label}
                {/* hover underline — grows from the left */}
                <span className="pointer-events-none absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-flame/70 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                {/* active underline — slides between links */}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full bg-flame"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            id="cart-fab"
            onClick={openDrawer}
            aria-label={`Open cart${count > 0 ? `, ${count} items` : ""}`}
            className="relative rounded-pill border border-cocoa/15 bg-white p-2.5 hover:bg-flame hover:text-white transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4 }}
                animate={{ scale: [0.4, 1.35, 1] }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-flame px-1 text-xs font-bold text-white ring-2 ring-cream-50"
              >
                {count}
              </motion.span>
            )}
          </button>
          <Link href="/menu" className="hidden md:inline-flex btn-primary">
            Order Now
          </Link>
          <button
            className="md:hidden rounded-pill border border-cocoa/15 bg-white p-2.5"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-cocoa/10 bg-cream-50"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-semibold uppercase tracking-wide text-cocoa hover:bg-white"
                >
                  {n.label}
                </Link>
              ))}
              <Link href="/menu" onClick={() => setOpen(false)} className="btn-primary mt-2 justify-center">
                Order Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
