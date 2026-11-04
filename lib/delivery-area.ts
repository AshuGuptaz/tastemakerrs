/**
 * Delivery area + same-day cutoff — pure helpers (no React) so they can be
 * unit-tested and reused by the product page and checkout.
 *
 * OWNER-EDITABLE: SERVICEABLE_RANGES is the list of pincodes we deliver to.
 * It is DISPLAY-ONLY guidance — it never blocks an order server-side.
 */

/** Inclusive pincode ranges we deliver to. Lucknow city GPO ranges: 226001–226031. */
export const SERVICEABLE_RANGES: ReadonlyArray<readonly [number, number]> = [[226001, 226031]];

/** Same-day orders must be placed before this hour (IST, 24h clock) — matches the FAQ ("before noon"). */
export const SAME_DAY_CUTOFF_HOUR_IST = 12;

export const isValidPincode = (p: string): boolean => /^[1-9]\d{5}$/.test(p);

export function isServiceablePincode(p: string): boolean {
  if (!isValidPincode(p)) return false;
  const n = Number(p);
  return SERVICEABLE_RANGES.some(([lo, hi]) => n >= lo && n <= hi);
}

/** Current hour/minute in India, independent of the viewer's/server's timezone. */
function istClock(now: Date): { h: number; m: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(now);
  const num = (t: string) => Number(parts.find((x) => x.type === t)?.value ?? 0);
  return { h: num("hour") % 24, m: num("minute") };
}

/** Same-day status at `now`: `minutesLeft` is until the cutoff when still open. */
export function sameDayStatus(now: Date = new Date()): { open: boolean; minutesLeft: number } {
  const { h, m } = istClock(now);
  const minutesLeft = SAME_DAY_CUTOFF_HOUR_IST * 60 - (h * 60 + m);
  return minutesLeft > 0 ? { open: true, minutesLeft } : { open: false, minutesLeft: 0 };
}

/** "2h 14m" / "45 min" */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}m` : `${m} min`;
}
