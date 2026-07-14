"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  m,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { ShoppingBag, Menu as MenuIcon, X, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useCartUI } from "@/context/CartUIContext";

const NAV = [
  { href: "/menu",        label: "Menu"      },
  { href: "/custom-cake", label: "Customize" },
  { href: "/kitchen",     label: "Kitchen"   },
  { href: "/offers",      label: "Offers"    },
  { href: "/about",       label: "About"     },
  { href: "/contact",     label: "Contact"   },
];

const E2 = "0 6px 20px -6px rgba(18,17,19,0.10), 0 2px 6px -2px rgba(18,17,19,0.06)";
const E3 = "0 24px 60px -20px rgba(18,17,19,0.22), 0 8px 24px -12px rgba(18,17,19,0.12)";

export default function Navbar() {
  const pathname  = usePathname();
  const reduce    = useReducedMotion();
  const { count } = useCart();
  const { openDrawer } = useCartUI();
  const [open, setOpen] = useState(false);

  /* ── Scroll-linked squeeze ─────────────────────────────────────────────── */
  const { scrollY } = useScroll();
  const sq = useSpring(
    useTransform(scrollY, [0, 40], [0, 1], { clamp: true }),
    { stiffness: 520, damping: 42, mass: 0.35 }
  );
  const pillScale = useTransform(sq, [0, 1], [1, 0.78]);
  const pillBg    = useTransform(sq, [0, 1], ["rgba(255,255,255,0.72)", "rgba(255,255,255,0.96)"]);
  const pillShadow = useTransform(sq, [0, 1], [E2, E3]);


  /* ── Magic hover indicator ─────────────────────────────────────────────── */
  const navEl = useRef<HTMLElement>(null);
  const [hovered, setHovered]     = useState<string | null>(null);
  const [indicator, setIndicator] = useState({ x: 0, w: 0 });

  const track = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Use layout offsets (immune to the parent's scroll-squeeze CSS scale),
    // not getBoundingClientRect — the latter returns scaled screen pixels that
    // misplace the ghost pill once the navbar shrinks.
    const el = e.currentTarget as HTMLElement;
    setIndicator({ x: el.offsetLeft, w: el.offsetWidth });
  };

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 pt-3 md:pt-4">
      <div className="container-x">

        {/* ── Floating pill ─────────────────────────────────────────────── */}
        <m.div
          style={{
            scale:           reduce ? 1 : pillScale,
            backgroundColor: pillBg,
            boxShadow:       pillShadow,
            transformOrigin: "center top",
            willChange:      "transform",
          }}
          className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-pill border border-line px-3.5 py-3 backdrop-blur-xl"
        >

          {/* ── Logo + desktop nav, grouped so they sit close together ── */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              aria-label="The Taste Makerrs — home"
              className="group flex items-center gap-2 rounded-pill pl-1 pr-2 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-redesign-wordmark-full.png"
                alt="The Taste Makerrs"
                className="h-6 w-auto select-none transition-transform duration-300 group-hover:-translate-y-0.5"
              />
            </Link>

            {/* ── Desktop nav with magic hover indicator ────────────────── */}
            <nav
              ref={navEl}
              className="relative hidden items-center gap-0.5 md:flex"
              onMouseLeave={() => setHovered(null)}
            >
              {/* Sliding ghost pill — tracks the hovered item */}
              <m.span
                aria-hidden
                className="pointer-events-none absolute inset-y-[3px] rounded-pill bg-ink/[0.055]"
                style={{ willChange: "transform, width, opacity" }}
                initial={false}
                animate={{
                  x:       indicator.x,
                  width:   indicator.w,
                  opacity: hovered ? 1 : 0,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 36, mass: 0.28 }}
              />

              {NAV.map((n) => {
                const active = pathname === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    onMouseEnter={(e) => { setHovered(n.href); track(e); }}
                    className={`relative z-10 rounded-pill px-3.5 py-2 text-sm tracking-tight transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15 ${
                      active
                        ? "font-semibold text-flame-700"
                        : "font-medium text-ink-mut hover:text-ink"
                    }`}
                  >
                    {n.label}
                    {/* Active-page underline pill — separate from hover ghost */}
                    {active && (
                      <m.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-pill bg-flame/10 ring-1 ring-flame/20"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* ── Actions ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">

            {/* Cart */}
            <button
              id="cart-fab"
              onClick={openDrawer}
              aria-label={`Open cart${count > 0 ? `, ${count} items` : ""}`}
              className="relative grid h-9 w-9 place-items-center rounded-pill text-ink transition-colors hover:bg-ink/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
            >
              <ShoppingBag className="h-[1.1rem] w-[1.1rem]" />
              {count > 0 && (
                <m.span
                  key={count}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: [0.4, 1.3, 1] }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-flame px-1 text-[10px] font-bold text-white ring-2 ring-surface"
                >
                  {count}
                </m.span>
              )}
            </button>


            {/* Mobile hamburger */}
            <button
              className="grid h-9 w-9 place-items-center rounded-pill text-ink hover:bg-ink/[0.05] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </m.div>

        {/* ── Mobile menu + scrim ────────────────────────────────────────── */}
        <AnimatePresence>
          {open && (
            <m.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 -z-10 bg-ink/40 backdrop-blur-sm md:hidden"
            />
          )}
          {open && (
            <m.div
              key="menu"
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
                  aria-current={pathname === n.href ? "page" : undefined}
                  className={`block rounded-xl px-4 py-3 text-base tracking-tight transition-colors ${
                    pathname === n.href
                      ? "bg-flame/10 font-semibold text-flame-700"
                      : "font-medium text-ink hover:bg-ink/[0.04]"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
              <Link href="/menu" onClick={() => setOpen(false)} className="btn-ink mt-1 w-full">
                Order now <ArrowRight className="h-4 w-4" />
              </Link>
            </m.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
}
