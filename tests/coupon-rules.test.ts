import { test } from "node:test";
import assert from "node:assert/strict";
import { checkCoupon, type CouponDoc, type EligibilityCtx } from "../lib/coupon-rules";

const base: CouponDoc = { code: "TEST10", kind: "percent", value: 10, active: true };
const ctx = (o: Partial<EligibilityCtx> = {}): EligibilityCtx => ({
  now: new Date("2026-11-11T10:00:00Z"), subtotal: 1000, timesUsedTotal: 0, contactPaidOrders: 0, contactUsesOfCode: 0, ...o,
});
const why = (r: ReturnType<typeof checkCoupon>) => (r.ok ? "ok" : r.reason);

test("happy path returns the discount from the pricing engine", () => {
  const r = checkCoupon(base, ctx());
  assert.ok(r.ok && r.discount === 100);
});

test("inactive / not started / expired", () => {
  assert.match(why(checkCoupon({ ...base, active: false }, ctx())), /not valid/);
  assert.match(why(checkCoupon({ ...base, startsAt: new Date("2026-12-01") }, ctx())), /isn't active yet/);
  assert.match(why(checkCoupon({ ...base, expiresAt: new Date("2026-11-01") }, ctx())), /expired/);
  assert.equal(why(checkCoupon({ ...base, expiresAt: new Date("2026-11-30") }, ctx())), "ok");
});

test("total usage limit counts paid redemptions", () => {
  const c = { ...base, usageLimit: 5 };
  assert.equal(why(checkCoupon(c, ctx({ timesUsedTotal: 4 }))), "ok");
  assert.match(why(checkCoupon(c, ctx({ timesUsedTotal: 5 }))), /fully redeemed/);
});

test("minimum subtotal message names the amount", () => {
  assert.match(why(checkCoupon({ ...base, minSubtotal: 1500 }, ctx())), /₹1,500|1,500/);
});

test("firstOrderOnly (FIRSTBITE) and oncePerContact (BDAY150) behave like the old hardcoded rules", () => {
  const first = { ...base, firstOrderOnly: true };
  assert.equal(why(checkCoupon(first, ctx({ contactPaidOrders: 0 }))), "ok");
  assert.match(why(checkCoupon(first, ctx({ contactPaidOrders: 1 }))), /first order/);
  // an old order with a DIFFERENT code still blocks first-order-only…
  const once = { ...base, oncePerContact: true };
  assert.equal(why(checkCoupon(once, ctx({ contactPaidOrders: 3, contactUsesOfCode: 0 }))), "ok"); // …but not once-per-contact
  assert.match(why(checkCoupon(once, ctx({ contactUsesOfCode: 1 }))), /already been used/);
});

test("a rule that earns nothing is rejected, not silently applied", () => {
  assert.match(why(checkCoupon({ ...base, value: 0 }, ctx())), /doesn't apply/);
});
