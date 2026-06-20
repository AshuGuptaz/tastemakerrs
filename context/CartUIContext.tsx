"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type Flyer = {
  id: number;
  image: string;
  from: { x: number; y: number };
};

type CartUICtx = {
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  flyers: Flyer[];
  /** Launch a "fly to cart" animation from a source element's rect. */
  flyToCart: (image: string | undefined, fromRect: DOMRect) => void;
  removeFlyer: (id: number) => void;
};

const Ctx = createContext<CartUICtx | null>(null);

export function CartUIProvider({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const nextId = useRef(0);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const removeFlyer = useCallback(
    (id: number) => setFlyers((f) => f.filter((x) => x.id !== id)),
    []
  );

  const flyToCart = useCallback((image: string | undefined, fromRect: DOMRect) => {
    // Skip the flourish if the image isn't a real photo (emoji fallback) or
    // the user prefers reduced motion.
    const isPhoto = !!image && (image.startsWith("/") || image.startsWith("http"));
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isPhoto || reduce) return;

    const id = nextId.current++;
    setFlyers((f) => [
      ...f,
      {
        id,
        image: image as string,
        from: { x: fromRect.left + fromRect.width / 2, y: fromRect.top + fromRect.height / 2 },
      },
    ]);
  }, []);

  const value = useMemo(
    () => ({ drawerOpen, openDrawer, closeDrawer, flyers, flyToCart, removeFlyer }),
    [drawerOpen, openDrawer, closeDrawer, flyers, flyToCart, removeFlyer]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCartUI() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCartUI must be used inside <CartUIProvider>");
  return ctx;
}
