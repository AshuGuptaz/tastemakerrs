import { test } from "node:test";
import assert from "node:assert/strict";
import { suggestAddOns } from "../lib/upsell";
import { PRODUCTS } from "../lib/products";
import { FREE_DELIVERY_ABOVE } from "../lib/pricing";

test("empty cart → no suggestions", () => {
  assert.deepEqual(suggestAddOns([], 0), []);
});

test("never suggests cakes/hampers or items already in the cart", () => {
  const inCart = PRODUCTS.filter((p) => p.category === "cookies").map((p) => p.id);
  const out = suggestAddOns(inCart, 500, 10);
  assert.ok(out.length > 0);
  for (const p of out) {
    assert.ok(!["cakes", "hampers"].includes(p.category));
    assert.ok(!inCart.includes(p.id));
  }
});

test("under the threshold, add-ons that reach free delivery come first, cheapest first", () => {
  const subtotal = FREE_DELIVERY_ABOVE - 250; // gap 250
  const out = suggestAddOns([], subtotal, 3);
  const crossing = out.filter((p) => p.price >= 250);
  assert.ok(crossing.length > 0);
  assert.equal(out[0].price >= 250, true);
  const sorted = [...crossing].sort((a, b) => a.price - b.price);
  assert.deepEqual(crossing.map((p) => p.id), sorted.map((p) => p.id));
});

test("spreads across categories and respects the limit", () => {
  const out = suggestAddOns([], 600, 3);
  assert.equal(out.length, 3);
  assert.equal(new Set(out.map((p) => p.category)).size, 3);
});
