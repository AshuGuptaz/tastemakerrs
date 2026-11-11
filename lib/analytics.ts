/**
 * Funnel analytics (GA4). Single entry point so call sites never touch
 * `window.gtag` directly. Everything is a silent no-op when
 * NEXT_PUBLIC_GA_ID is unset (dev, previews) or the script is blocked —
 * analytics must never be able to break checkout.
 *
 * Funnel: view_item → add_to_cart → begin_checkout → otp_requested →
 * otp_verified → purchase. PII (name/phone/email/address) is NEVER sent.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

type Item = { id: string; name: string; price: number; qty?: number; variant?: string };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !GA_ID) return;
  try {
    window.gtag?.("event", event, params);
  } catch {
    /* never throw from analytics */
  }
}

export const toGaItems = (items: Item[]) =>
  items.map((i) => ({
    item_id: i.id,
    item_name: i.name,
    price: i.price,
    quantity: i.qty ?? 1,
    ...(i.variant ? { item_variant: i.variant } : {}),
  }));

export const trackViewItem = (i: Item) =>
  track("view_item", { currency: "INR", value: i.price, items: toGaItems([i]) });

export const trackAddToCart = (i: Item) =>
  track("add_to_cart", { currency: "INR", value: i.price * (i.qty ?? 1), items: toGaItems([i]) });

export const trackBeginCheckout = (items: Item[], value: number) =>
  track("begin_checkout", { currency: "INR", value, items: toGaItems(items) });

/** Remember what was ordered so /order-success (incl. the Stripe redirect) can report the purchase. */
const PENDING_KEY = "ttm_pending_purchase";
export function stashPurchase(p: { id: string; value: number; shipping: number; coupon?: string | null; items: Item[] }) {
  try { sessionStorage.setItem(PENDING_KEY, JSON.stringify(p)); } catch {}
}

/** Fire `purchase` once per order id (deduped across reloads). */
export function trackPurchaseOnce(orderId: string) {
  try {
    const doneKey = `ttm_purchase_tracked_${orderId}`;
    if (sessionStorage.getItem(doneKey)) return;
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (p?.id !== orderId) return;
    track("purchase", {
      transaction_id: p.id,
      currency: "INR",
      value: p.value,
      shipping: p.shipping,
      ...(p.coupon ? { coupon: p.coupon } : {}),
      items: toGaItems(p.items),
    });
    sessionStorage.setItem(doneKey, "1");
    sessionStorage.removeItem(PENDING_KEY);
  } catch {}
}
