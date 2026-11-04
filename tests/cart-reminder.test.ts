import { test } from "node:test";
import assert from "node:assert/strict";
import { cartSignature, isCartDue, signUnsub, verifyUnsub } from "../lib/cart-reminder";

const NOW = new Date("2026-08-10T12:00:00Z");
const ago = (h: number) => new Date(NOW.getTime() - h * 3_600_000);
const base = { itemCount: 2, cartUpdatedAt: ago(5), remindedAt: null as Date | null, optedOut: false };

test("signature ignores order, tracks qty/variant", () => {
  const a = cartSignature([{ productId: "a", qty: 1 }, { productId: "b", qty: 2 }]);
  const b = cartSignature([{ productId: "b", qty: 2 }, { productId: "a", qty: 1 }]);
  assert.equal(a, b);
  assert.notEqual(a, cartSignature([{ productId: "a", qty: 2 }, { productId: "b", qty: 2 }]));
  assert.notEqual(a, cartSignature([{ productId: "a", qty: 1, variant: "1kg" }, { productId: "b", qty: 2 }]));
  assert.equal(cartSignature([]), "");
});

test("due only inside the 3h–48h window", () => {
  assert.equal(isCartDue({ ...base, cartUpdatedAt: ago(1) }, NOW, false), false); // too fresh
  assert.equal(isCartDue({ ...base, cartUpdatedAt: ago(3.01) }, NOW, false), true);
  assert.equal(isCartDue({ ...base, cartUpdatedAt: ago(47) }, NOW, false), true);
  assert.equal(isCartDue({ ...base, cartUpdatedAt: ago(49) }, NOW, false), false); // too stale
});

test("never when empty, opted out, or already paid", () => {
  assert.equal(isCartDue({ ...base, itemCount: 0 }, NOW, false), false);
  assert.equal(isCartDue({ ...base, optedOut: true }, NOW, false), false);
  assert.equal(isCartDue(base, NOW, true), false);
});

test("at most once per cart state, and once per 7 days", () => {
  // reminded after the cart last changed → don't repeat
  assert.equal(isCartDue({ ...base, remindedAt: ago(2) }, NOW, false), false);
  // cart edited after a reminder 2 days ago → still within the 7-day gap
  assert.equal(isCartDue({ ...base, cartUpdatedAt: ago(5), remindedAt: ago(48) }, NOW, false), false);
  // cart edited after a reminder 10 days ago → fine again
  assert.equal(isCartDue({ ...base, cartUpdatedAt: ago(5), remindedAt: ago(240) }, NOW, false), true);
});

test("unsubscribe token: valid, tamper-proof, bound to the customer", () => {
  process.env.OTP_JWT_SECRET = "test-secret-test-secret-test-secret";
  const t = signUnsub("cust1");
  assert.equal(verifyUnsub("cust1", t), true);
  assert.equal(verifyUnsub("cust2", t), false);
  assert.equal(verifyUnsub("cust1", t.slice(0, -2) + "00"), false);
  assert.equal(verifyUnsub("cust1", "not-hex"), false);
  assert.equal(verifyUnsub("cust1", ""), false);
});
