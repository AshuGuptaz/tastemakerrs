import { test } from "node:test";
import assert from "node:assert/strict";
import { couponValue, deliveryFee, computeTotals, DELIVERY_FEE, FREE_DELIVERY_ABOVE } from "../lib/pricing";

test("couponValue: percentage + threshold coupons", () => {
  assert.equal(couponValue("FIRSTBITE", 1000), 100); // 10%
  assert.equal(couponValue("HAMPER20", 1000), 200); // 20%
  assert.equal(couponValue("BDAY150", 999), 150); // exactly at threshold
  assert.equal(couponValue("BDAY150", 998), 0); // below threshold
  assert.equal(couponValue("BULK10", 3000), 300); // at threshold, 10%
  assert.equal(couponValue("BULK10", 2999), 0); // below threshold
  assert.equal(couponValue("UNKNOWN", 5000), 0); // unknown code earns nothing
  assert.equal(couponValue("", 5000), 0);
});

test("couponValue: rounds half-rupee discounts", () => {
  // 995 * 0.1 = 99.5 -> Math.round -> 100 (same on client and server since both use this fn)
  assert.equal(couponValue("FIRSTBITE", 995), 100);
});

test("deliveryFee: free above threshold, flat below", () => {
  assert.equal(deliveryFee(FREE_DELIVERY_ABOVE), 0);
  assert.equal(deliveryFee(FREE_DELIVERY_ABOVE - 1), DELIVERY_FEE);
  assert.equal(deliveryFee(0), DELIVERY_FEE); // empty-cart edge is unreachable in UI but defined
});

test("computeTotals: normalizes coupon case and drops non-earning codes", () => {
  const t = computeTotals(1000, "firstbite");
  assert.equal(t.subtotal, 1000);
  assert.equal(t.delivery, 0); // 1000 >= 999
  assert.equal(t.discount, 100);
  assert.equal(t.total, 900);
  assert.equal(t.coupon, "FIRSTBITE"); // normalized to uppercase

  // A coupon that earns nothing at this subtotal is stored as null, not the code.
  const t2 = computeTotals(500, "BULK10");
  assert.equal(t2.discount, 0);
  assert.equal(t2.coupon, null);
  assert.equal(t2.delivery, DELIVERY_FEE); // 500 < 999
  assert.equal(t2.total, 500 + DELIVERY_FEE);
});

test("computeTotals: never goes negative", () => {
  // Contrived huge discount can't push total below 0
  const t = computeTotals(50, "HAMPER20");
  assert.ok(t.total >= 0);
});

test("computeTotals: no coupon", () => {
  const t = computeTotals(1200, null);
  assert.equal(t.discount, 0);
  assert.equal(t.coupon, null);
  assert.equal(t.total, 1200); // free delivery, no discount
});
