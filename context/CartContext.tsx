"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const add: CartCtx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id && p.variant === item.variant);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
    toast.success(`Added ${item.name}`);
  };

  const remove: CartCtx["remove"] = (id, variant) =>
    setItems((prev) => prev.filter((p) => !(p.id === id && p.variant === variant)));

  const setQty: CartCtx["setQty"] = (id, variant, qty) =>
    setItems((prev) =>
      prev.map((p) =>
        p.id === id && p.variant === variant ? { ...p, qty: Math.max(1, qty) } : p
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
