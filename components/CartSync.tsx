"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";

/**
 * Invisible. For SIGNED-IN customers only, mirrors the cart to the server
 * (debounced) so a single abandoned-cart email can be sent. Guests are never
 * synced (we couldn't reach them anyway).
 *
 * Careful about one thing: an EMPTY local cart is only sent after we've seen a
 * non-empty one this session (i.e. they emptied it / checked out). Otherwise
 * opening the site on a second device with an empty cart would wipe the
 * snapshot of the cart they built on their phone.
 */
export default function CartSync() {
  const { items, hydrated } = useCart();
  const { customer } = useCustomer();
  const lastSent = useRef<string | null>(null);
  const hadItems = useRef(false);

  useEffect(() => {
    if (!hydrated || !customer) return;
    if (items.length > 0) hadItems.current = true;
    if (items.length === 0 && !hadItems.current) return;

    const payload = items.map((i) => ({
      productId: i.id,
      name: i.name,
      price: i.price,
      qty: i.qty,
      ...(i.variant ? { variant: i.variant } : {}),
      ...(i.image && i.image.startsWith("/") ? { image: i.image } : {}),
    }));
    const sig = JSON.stringify(payload);
    if (sig === lastSent.current) return;

    const t = setTimeout(() => {
      fetch("/api/account/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: payload }),
        keepalive: true,
      })
        .then((r) => { if (r.ok) lastSent.current = sig; })
        .catch(() => {});
    }, 4000);
    return () => clearTimeout(t);
  }, [items, hydrated, customer]);

  return null;
}
