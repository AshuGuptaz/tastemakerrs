/**
 * Public contact details — single source of truth for WhatsApp links.
 * Number is in international format with no "+" or spaces (wa.me requirement).
 */
export const WHATSAPP_NUMBER = "917905717007";

/** wa.me deep link: opens WhatsApp (app on phones, Web/Desktop otherwise) with the text pre-filled. */
export function whatsappLink(text?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Canonical site origin (no trailing slash) — used for sitemap, robots, JSON-LD. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.thetastemakerrs.com").replace(/\/+$/, "");
