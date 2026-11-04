import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidPincode, isServiceablePincode, sameDayStatus, formatMinutes } from "../lib/delivery-area";

test("pincode validity", () => {
  assert.equal(isValidPincode("226001"), true);
  assert.equal(isValidPincode("22600"), false);
  assert.equal(isValidPincode("0226001"), false);
  assert.equal(isValidPincode("026001"), false); // can't start with 0
  assert.equal(isValidPincode("22600a"), false);
});

test("serviceable = Lucknow city range, edges inclusive", () => {
  assert.equal(isServiceablePincode("226001"), true);
  assert.equal(isServiceablePincode("226010"), true);
  assert.equal(isServiceablePincode("226031"), true);
  assert.equal(isServiceablePincode("226000"), false);
  assert.equal(isServiceablePincode("226032"), false);
  assert.equal(isServiceablePincode("110001"), false); // Delhi
  assert.equal(isServiceablePincode("abc"), false);
});

// IST = UTC+5:30, so 06:00 UTC = 11:30 IST (open), 07:00 UTC = 12:30 IST (closed)
test("same-day cutoff is noon IST regardless of server timezone", () => {
  const open = sameDayStatus(new Date("2026-08-01T06:00:00Z")); // 11:30 IST
  assert.deepEqual(open, { open: true, minutesLeft: 30 });
  const closed = sameDayStatus(new Date("2026-08-01T07:00:00Z")); // 12:30 IST
  assert.equal(closed.open, false);
  assert.equal(sameDayStatus(new Date("2026-08-01T06:30:00Z")).open, false); // exactly 12:00 → closed
  const early = sameDayStatus(new Date("2026-08-01T00:00:00Z")); // 05:30 IST
  assert.deepEqual(early, { open: true, minutesLeft: 390 });
  const lateNight = sameDayStatus(new Date("2026-08-01T18:30:00Z")); // 00:00 IST next day
  assert.equal(lateNight.minutesLeft, 720);
});

test("formatMinutes", () => {
  assert.equal(formatMinutes(45), "45 min");
  assert.equal(formatMinutes(134), "2h 14m");
  assert.equal(formatMinutes(120), "2h 00m");
});
