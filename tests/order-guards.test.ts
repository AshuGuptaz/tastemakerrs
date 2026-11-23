import { test } from "node:test";
import assert from "node:assert/strict";
import { AddressSchema, ItemsSchema, MAX_ITEMS, MAX_TOTAL_IMAGE_CHARS } from "../lib/order-schema";
import { canStartPayment } from "../lib/order-payable";
import { orderCouponStillValid } from "../lib/coupons";

const item = (extra: object = {}) => ({ productId: "p1", name: "Cake", price: 100, qty: 1, ...extra });
const addr = { name: "A", email: "x@y.com", phone: "9876543210", street: "s", city: "c", state: "st", pincode: "226001" };

// Bug 4 — item caps
test("accepts up to MAX_ITEMS items, rejects more", () => {
  assert.ok(ItemsSchema.safeParse(Array.from({ length: MAX_ITEMS }, () => item())).success);
  assert.ok(!ItemsSchema.safeParse(Array.from({ length: MAX_ITEMS + 1 }, () => item())).success);
});

test("rejects an empty item list", () => assert.ok(!ItemsSchema.safeParse([]).success));

test("rejects orders whose combined custom images exceed the cap", () => {
  const big = "a".repeat(1_900_000); // each under the per-item 2MB cap
  const n = Math.floor(MAX_TOTAL_IMAGE_CHARS / big.length);
  const ok = Array.from({ length: n }, () => item({ custom: { image: big } }));
  const tooMany = Array.from({ length: n + 1 }, () => item({ custom: { image: big } }));
  assert.ok(ItemsSchema.safeParse(ok).success);
  assert.ok(!ItemsSchema.safeParse(tooMany).success);
});

test("a single image over the per-item cap is still rejected", () => {
  assert.ok(!ItemsSchema.safeParse([item({ custom: { image: "a".repeat(2_000_001) } })]).success);
});

// Bug 2 — email normalisation
test("address email is trimmed and lowercased", () => {
  const r = AddressSchema.parse({ ...addr, email: "  John@Gmail.COM " });
  assert.equal(r.email, "john@gmail.com");
});

test("invalid email still rejected", () => {
  assert.ok(!AddressSchema.safeParse({ ...addr, email: "nope" }).success);
});

// Bug 3 — which orders may start a payment
test("only unpaid/failed, non-cancelled orders can start payment", () => {
  assert.equal(canStartPayment({ paymentStatus: "unpaid", status: "pending" }), true);
  assert.equal(canStartPayment({ paymentStatus: "failed", status: "pending" }), true);
  assert.equal(canStartPayment({ paymentStatus: "paid", status: "paid" }), false);
  assert.equal(canStartPayment({ paymentStatus: "refunded", status: "refunded" }), false);
  assert.equal(canStartPayment({ paymentStatus: "unpaid", status: "cancelled" }), false);
});

// Bug 1 — only the no-coupon short-circuit is DB-free; the eligibility rules
// themselves are covered by coupon-rules.test.ts.
test("order without a coupon never touches the DB and is always fine", async () => {
  assert.deepEqual(await orderCouponStillValid({ coupon: null, subtotal: 500 }), { ok: true });
  assert.deepEqual(await orderCouponStillValid({ coupon: "", subtotal: 500 }), { ok: true });
});
