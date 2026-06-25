"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu as MenuIcon, X, ArrowRight } from "lucide-react";
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
    <header className="sticky top-0 z-50 pt-3 md:pt-4">
      <div className="container-x">
        {/* Floating pill */}
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-pill border border-line bg-surface/80 px-3 py-2 shadow-e2 backdrop-blur-xl">
          {/* Brand */}
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-pill pl-1.5 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-sm font-bold text-white">tm</span>
            <span className="text-[1.05rem] font-semibold tracking-tighter2 text-ink">
              Taste <span className="text-flame">Makerrs</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`relative rounded-pill px-3.5 py-2 text-sm font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15 ${
                    active ? "text-ink" : "text-ink-mut hover:text-ink"
                  }`}
                >
                  {n.label}
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-pill bg-ink/[0.06]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              id="cart-fab"
              onClick={openDrawer}
              aria-label={`Open cart${count > 0 ? `, ${count} items` : ""}`}
              className="relative grid h-9 w-9 place-items-center rounded-pill text-ink transition-colors hover:bg-ink/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
            >
              <ShoppingBag className="h-[1.1rem] w-[1.1rem]" />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: [0.4, 1.3, 1] }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-flame px-1 text-[10px] font-bold text-white ring-2 ring-surface"
                >
                  {count}
                </motion.span>
              )}
            </button>

            <Link href="/menu" className="hidden md:inline-flex btn-ink group px-4 py-2 text-sm">
              Order now
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>

            <button
              className="grid h-9 w-9 place-items-center rounded-pill text-ink hover:bg-ink/[0.05] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
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
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto mt-2 max-w-5xl overflow-hidden rounded-[1.5rem] border border-line bg-surface/95 p-2 shadow-e2 backdrop-blur-xl md:hidden"
            >
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-medium tracking-tight text-ink transition-colors hover:bg-ink/[0.04]"
                >
                  {n.label}
                </Link>
              ))}
              <Link href="/menu" onClick={() => setOpen(false)} className="btn-ink mt-1 w-full">
                Order now <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
