/**
 * Server-side coupon valuation. Mirrors the client `couponValue` in
 * app/checkout/page.tsx exactly so server price authority matches the UI.
 */
export function couponValue(code: string | null | undefined, subtotal: number): number {
  const c = (code || "").trim().toUpperCase();
  const map: Record<string, number> = {
    FIRSTBITE: Math.round(subtotal * 0.10),
    BDAY150: subtotal >= 999 ? 150 : 0,
    HAMPER20: Math.round(subtotal * 0.20),
    BULK10: subtotal >= 3000 ? Math.round(subtotal * 0.10) : 0,
  };
  return map[c] || 0;
}
