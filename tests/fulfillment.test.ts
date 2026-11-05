import { test } from "node:test";
import assert from "node:assert/strict";
import { isSlotBookable, bookableSlots, DELIVERY_SLOTS, SLOT_START_HOUR } from "../lib/fulfillment";
import { istNow } from "../lib/delivery-area";

// IST = UTC+5:30. Helper: build a Date from an IST wall-clock time.
const ist = (date: string, hhmm: string) => new Date(`${date}T${hhmm}:00+05:30`);
const D = "2026-08-10"; // "today" in these tests
const TOMORROW = "2026-08-11";

test("istNow reads India time regardless of server timezone", () => {
  assert.deepEqual(istNow(ist(D, "10:30")), { date: D, minutes: 630 });
  // 23:00 UTC on the 9th is already 04:30 IST on the 10th
  assert.deepEqual(istNow(new Date("2026-08-09T23:00:00Z")), { date: D, minutes: 270 });
});

test("slot start hours line up with the labels customers see", () => {
  for (const s of DELIVERY_SLOTS) {
    const startLabel = parseInt(s.label, 10); // "9 AM – 12 PM" → 9, "12 – 3 PM" → 12, "3 – 6 PM" → 3, "6 – 9 PM" → 6
    const h = SLOT_START_HOUR[s.id];
    assert.ok(h === startLabel || h === startLabel + 12, `${s.id}: start ${h} vs label "${s.label}"`);
  }
});

test("today, 10:00 IST: only slots starting ≥2h out", () => {
  assert.deepEqual(bookableSlots(D, ist(D, "10:00")), ["afternoon", "evening", "night"]);
});
test("today, 11:59 IST: still before cutoff but only the late slots have 2h lead", () => {
  assert.deepEqual(bookableSlots(D, ist(D, "11:59")), ["evening", "night"]);
});
test("today, 12:00 IST or later: same-day is closed (the promise is 'before noon')", () => {
  assert.deepEqual(bookableSlots(D, ist(D, "12:00")), []);
  assert.deepEqual(bookableSlots(D, ist(D, "17:00")), []);
  assert.equal(isSlotBookable(D, "morning", ist(D, "17:00")), false); // the reported bug
});
test("early morning: every slot except ones <2h away", () => {
  assert.deepEqual(bookableSlots(D, ist(D, "06:30")), ["morning", "afternoon", "evening", "night"]);
  assert.deepEqual(bookableSlots(D, ist(D, "07:30")), ["afternoon", "evening", "night"]); // 9:00 is 1.5h away
});
test("tomorrow is always fully bookable; yesterday never", () => {
  assert.equal(bookableSlots(TOMORROW, ist(D, "23:59")).length, 4);
  assert.equal(bookableSlots("2026-08-09", ist(D, "00:01")).length, 0);
});
test("a viewer in another timezone gets India's answer (23:00 UTC = 04:30 IST next day)", () => {
  const now = new Date("2026-08-09T23:00:00Z");
  assert.equal(isSlotBookable("2026-08-09", "morning", now), false); // already yesterday in India
  assert.equal(isSlotBookable(D, "morning", now), true);              // 04:30 IST, 9 AM slot is 4.5h away
});
test("server grace: a slot that just became unbookable still passes within grace", () => {
  const now = ist(D, "10:05"); // afternoon (12:00) is 1h55m away → strictly closed
  assert.equal(isSlotBookable(D, "afternoon", now, 0), false);
  assert.equal(isSlotBookable(D, "afternoon", now, 15), true);
  // grace only softens the lead time slightly — it never reopens a slot that has already started
  assert.equal(isSlotBookable(D, "afternoon", ist(D, "12:10"), 15), false);
});
