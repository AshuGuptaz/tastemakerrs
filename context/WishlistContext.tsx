"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type WishlistCtx = {
  ids: string[];
  count: number;
  hydrated: boolean;
  has: (id: string) => boolean;
  toggle: (id: string) => boolean; // returns the new saved state
  remove: (id: string) => void;
};

const WishlistContext = createContext<WishlistCtx | null>(null);

// Same key ProductDetail wrote to before this context existed — keep it so
// anything already saved survives the upgrade instead of silently vanishing.
const KEY = "ttm_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setIds(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(ids));
    } catch {
      // Quota exceeded or storage disabled — wishlist still works in-memory
      // for this session, it just won't survive a reload. Must not throw
      // here: no scoped error boundary sits above this effect.
    }
  }, [ids, hydrated]);

  // Cross-tab sync, same reasoning as CartContext: without this, two tabs
  // open at once silently clobber each other's saved items (last save wins).
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        const parsed = JSON.parse(e.newValue);
        if (Array.isArray(parsed)) setIds(parsed);
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has: WishlistCtx["has"] = (id) => ids.includes(id);

  const toggle: WishlistCtx["toggle"] = (id) => {
    let saved = false;
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      saved = true;
      return [...prev, id];
    });
    return saved;
  };

  const remove: WishlistCtx["remove"] = (id) => setIds((prev) => prev.filter((x) => x !== id));

  const value = useMemo<WishlistCtx>(
    () => ({ ids, count: ids.length, hydrated, has, toggle, remove }),
    [ids, hydrated]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
