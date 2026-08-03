/**
 * Delivery scheduling — the single source of truth for time slots and date
 * validity, imported by both the checkout UI and the /api/orders authority so
 * a slot the client offers is always one the server accepts.
 */

export const DELIVERY_SLOTS = [
  { id: "morning", label: "9 AM – 12 PM" },
  { id: "afternoon", label: "12 – 3 PM" },
  { id: "evening", label: "3 – 6 PM" },
  { id: "night", label: "6 – 9 PM" },
] as const;

export type SlotId = (typeof DELIVERY_SLOTS)[number]["id"];

export const SLOT_IDS: SlotId[] = DELIVERY_SLOTS.map((s) => s.id);

export function slotLabel(id: string | undefined): string {
  return DELIVERY_SLOTS.find((s) => s.id === id)?.label ?? "";
}

export function isSlotId(id: unknown): id is SlotId {
  return typeof id === "string" && (SLOT_IDS as string[]).includes(id);
}

// How far ahead a customer may schedule. Same-day is allowed (the brand
// promises same-day delivery across Lucknow), out to ~4 months.
const MAX_LEAD_DAYS = 120;

/** Local YYYY-MM-DD `offset` days from today (used for the picker's min date). */
export function isoDateOffset(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Server-side date sanity check. Deliberately forgiving on the near boundary
 * (accepts yesterday) so a UTC-vs-IST server/client timezone gap can never
 * reject a legitimately "today" selection on the payment path.
 */
export function isValidDeliveryDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const picked = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(picked.getTime())) return false;
  const now = new Date();
  const floor = new Date(now);
  floor.setDate(floor.getDate() - 1); // 1-day TZ slack
  const ceil = new Date(now);
  ceil.setDate(ceil.getDate() + MAX_LEAD_DAYS);
  return picked >= new Date(floor.toDateString()) && picked <= ceil;
}

/** Human date for emails/SMS, e.g. "Sat, 9 Aug 2026". */
export function formatDeliveryDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
