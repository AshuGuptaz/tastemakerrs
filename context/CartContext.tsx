"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image?: string;
  qty: number;
  variant?: string;
  custom?: Record<string, unknown>;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string, variant?: string) => void;
  setQty: (id: string, variant: string | undefined, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartCtx | null>(null);

const KEY = "ttm_cart_v1";
const MAX_QTY = 50;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // Only trust valid JSON that's actually an array — a bare JSON.parse
      // guard catches syntax errors, but "null"/"{}" parse fine and would
      // otherwise reach items.reduce() below and crash the whole app (there's
      // no scoped error boundary, only the root layout's global-error.tsx).
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // Quota exceeded (a custom-cake reference photo can push a cart item
      // over localStorage's per-origin limit) or storage disabled — the cart
      // still works in-memory for this session, it just won't survive a
      // reload. Must not throw here: this runs inside a useEffect with no
      // scoped error boundary, so an uncaught throw blanks the entire site.
    }
  }, [items, hydrated]);

  // Cross-tab sync: the storage event fires in OTHER tabs when this tab
  // writes to localStorage, so without this, two tabs open at once silently
  // clobber each other's cart edits (last save wins).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const add: CartCtx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id && p.variant === item.variant);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(MAX_QTY, next[idx].qty + qty) };
        return next;
      }
      return [...prev, { ...item, qty: Math.min(MAX_QTY, qty) }];
    });
    // NOTE: no toast here — callers own the "added" feedback (ProductCard /
    // ProductDetail fire the branded CartToast; custom-cake shows its own toast).
    // Firing one here too produced a duplicate toast on every add.
  };

  const remove: CartCtx["remove"] = (id, variant) =>
    setItems((prev) => prev.filter((p) => !(p.id === id && p.variant === variant)));

  const setQty: CartCtx["setQty"] = (id, variant, qty) =>
    setItems((prev) =>
      prev.map((p) =>
        // Clamp 1..MAX_QTY — matches the server-side per-item cap so the cart can
        // never build a total the order API will reject.
        p.id === id && p.variant === variant ? { ...p, qty: Math.min(MAX_QTY, Math.max(1, qty)) } : p
      )
    );

  const clear = () => setItems([]);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    return { items, count, subtotal, hydrated, add, remove, setQty, clear };
  }, [items, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
