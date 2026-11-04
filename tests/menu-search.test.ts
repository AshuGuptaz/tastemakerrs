import { test } from "node:test";
import assert from "node:assert/strict";
import { PRODUCTS } from "../lib/products";
import { matchesQuery } from "../lib/menu-search";

const find = (q: string) => PRODUCTS.filter((p) => matchesQuery(p, q));

test("empty / whitespace query matches everything", () => {
  assert.equal(find("").length, PRODUCTS.length);
  assert.equal(find("   ").length, PRODUCTS.length);
});
test("matches by name prefix, case-insensitive", () => {
  const r = find("TRUF");
  assert.ok(r.some((p) => p.slug === "truffle"));
});
test("all words must match", () => {
  assert.ok(find("truffle").length >= find("truffle zzzznotaword").length);
  assert.equal(find("truffle zzzznotaword").length, 0);
});
test("no match returns empty", () => assert.equal(find("qwertyuiop").length, 0));
test("punctuation is ignored", () => assert.equal(find("truffle!!").length, find("truffle").length));
