/**
 * Delivery scheduling — the single source of truth for time slots and date
 * validity, imported by both the checkout UI and the /api/orders authority so
 * a slot the client offers is always one the server accepts.
 */

import { istNow, SAME_DAY_CUTOFF_HOUR_IST } from "./delivery-area";

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
// promises same-day delivery across Lucknow), out to ~4 months. Exported so
// the date picker can disable out-of-range days instead of only enforcing
// this on the server — otherwise a selectable-looking date 150 days out
// 400s at submit with no warning in the UI.
export const MAX_LEAD_DAYS = 120;

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

/* ── Same-day rules ───────────────────────────────────────────────────────
 * The brand promise is "same-day if ordered before 12 noon" (FAQ, product page).
 * These make that rule real, in India time, for BOTH the checkout UI (to disable
 * unbookable slots) and /api/orders (the authority). Before this, every slot was
 * selectable for today at any hour — a 5 PM order could pay for the 9 AM–12 PM slot.
 */

/** When each slot STARTS (hour, IST). Must stay in step with DELIVERY_SLOTS labels. */
export const SLOT_START_HOUR: Record<SlotId, number> = { morning: 9, afternoon: 12, evening: 15, night: 18 };

/** A same-day slot must start at least this long after the order is placed (baking + packing + travel). */
export const MIN_LEAD_HOURS = 2;

/**
 * Can `slot` on `dateStr` (YYYY-MM-DD) still be booked at `now`?
 *  - any past date → no; any future date → yes
 *  - today → only before the noon cutoff AND only if the slot starts ≥ MIN_LEAD_HOURS away
 * `graceMin` loosens the TODAY checks (server uses a few minutes so a customer who picked a
 * valid slot and then took a while to pay isn't rejected at the last step).
 */
export function isSlotBookable(dateStr: string, slot: SlotId, now: Date = new Date(), graceMin = 0): boolean {
  const { date: today, minutes } = istNow(now);
  if (dateStr < today) return false;
  if (dateStr > today) return true;
  if (minutes >= SAME_DAY_CUTOFF_HOUR_IST * 60 + graceMin) return false;
  return SLOT_START_HOUR[slot] * 60 - minutes >= MIN_LEAD_HOURS * 60 - graceMin;
}

/** Slot ids bookable on `dateStr` at `now`. */
export function bookableSlots(dateStr: string, now: Date = new Date(), graceMin = 0): SlotId[] {
  return SLOT_IDS.filter((id) => isSlotBookable(dateStr, id, now, graceMin));
}

/** Human date for emails/SMS, e.g. "Sat, 9 Aug 2026". */
export function formatDeliveryDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}
