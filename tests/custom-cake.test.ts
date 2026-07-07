import { test } from "node:test";
import assert from "node:assert/strict";
import { priceCustomCake, customCakeName, DEFAULT_CUSTOM_BASE } from "../lib/custom-cake";

test("priceCustomCake: empty/forged spec falls back to the default base", () => {
  // The exploit case: a forged item with custom:{} must NOT be free/₹1 —
  // it reprices to the authoritative default base, never the client's number.
  assert.equal(priceCustomCake({}), DEFAULT_CUSTOM_BASE); // 600
  assert.equal(priceCustomCake({ flavor: "nope", weight: "nope", shape: "nope" } as any), DEFAULT_CUSTOM_BASE);
});

test("priceCustomCake: full spec derived from a base product", () => {
  // base Truffle (650) + pistachio (+250) + two-tier (+400) = 1300
  // × 2kg multiplier (3.4) = 4420, + eggless (30) + image (150) = 4600
  const price = priceCustomCake({
    base: "truffle",
    flavor: "pistachio",
    weight: "2kg",
    shape: "tier",
    eggless: true,
    hasImage: true,
  });
  assert.equal(price, 4600);
});

test("priceCustomCake: options add correctly without a base", () => {
  // default base 600 + chocolate (50) + heart (100) = 750 × 1kg (1.8) = 1350
  const price = priceCustomCake({ flavor: "chocolate", weight: "1kg", shape: "heart" });
  assert.equal(price, 1350);
});

test("priceCustomCake: eggless and image are additive after the multiplier", () => {
  // 600 × 1 (500g) = 600, + eggless 30 = 630
  assert.equal(priceCustomCake({ eggless: true }), 630);
  // 600 + image 150 = 750
  assert.equal(priceCustomCake({ hasImage: true }), 750);
});

test("customCakeName: server-authoritative, ignores unknown flavor", () => {
  assert.equal(customCakeName({ flavor: "pistachio", weight: "2kg" }), "Custom Luxury Pistachio (2 kg)");
  assert.equal(customCakeName({ flavor: "chocolate" }), "Custom Rich Chocolate");
  // Forged / unknown flavor collapses to a generic name (never the spoofed value)
  assert.equal(customCakeName({}), "Custom cake");
  assert.equal(customCakeName({ flavor: "totally-fake" } as any), "Custom cake");
});
