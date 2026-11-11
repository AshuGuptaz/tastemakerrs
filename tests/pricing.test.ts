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

import { discountForRule, BUILTIN_COUPONS, type CouponRule } from "../lib/pricing";

test("discountForRule: percent, flat, min subtotal, cap", () => {
  const pct: CouponRule = { code: "P", kind: "percent", value: 15 };
  assert.equal(discountForRule(pct, 1000), 150);
  assert.equal(discountForRule({ ...pct, maxDiscount: 100 }, 1000), 100); // capped
  assert.equal(discountForRule({ ...pct, maxDiscount: 500 }, 1000), 150); // cap not reached
  const flat: CouponRule = { code: "F", kind: "flat", value: 200, minSubtotal: 500 };
  assert.equal(discountForRule(flat, 500), 200);
  assert.equal(discountForRule(flat, 499), 0); // below minimum
  assert.equal(discountForRule({ code: "F2", kind: "flat", value: 500 }, 300), 300); // never exceeds subtotal
  assert.equal(discountForRule(pct, 0), 0);
  assert.equal(discountForRule(pct, -5), 0);
});

test("computeTotals: custom rule set (DB-backed coupons) drives the same math", () => {
  const rules: CouponRule[] = [{ code: "DIWALI25", kind: "percent", value: 25, maxDiscount: 400, minSubtotal: 800 }];
  const t = computeTotals(2000, "diwali25", rules);
  assert.equal(t.discount, 400); // 25% = 500, capped at 400
  assert.equal(t.coupon, "DIWALI25");
  assert.equal(computeTotals(2000, "FIRSTBITE", rules).discount, 0); // built-ins are NOT implicitly active
  assert.equal(computeTotals(700, "DIWALI25", rules).coupon, null); // below minimum earns nothing
});

test("BUILTIN_COUPONS reproduce the original hardcoded rules exactly", () => {
  const codes = BUILTIN_COUPONS.map((c) => c.code).sort();
  assert.deepEqual(codes, ["BDAY150", "BULK10", "FIRSTBITE", "HAMPER20"]);
  for (const sub of [100, 995, 998, 999, 1000, 2999, 3000, 12345]) {
    assert.equal(couponValue("FIRSTBITE", sub), Math.round(sub * 0.1));
    assert.equal(couponValue("HAMPER20", sub), Math.round(sub * 0.2));
    assert.equal(couponValue("BDAY150", sub), sub >= 999 ? 150 : 0);
    assert.equal(couponValue("BULK10", sub), sub >= 3000 ? Math.round(sub * 0.1) : 0);
  }
});
