import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInvoice, allocate, financialYear, invoiceNumber, gstConfig } from "../lib/gst";

const base = { sellerState: "Uttar Pradesh", ratePercent: 18 };

test("allocate sums exactly and respects weights", () => {
  const p = allocate(100, [1, 1, 1]);
  assert.equal(p.reduce((a, b) => a + b, 0), 100);
  assert.deepEqual(allocate(0, [5, 5]), [0, 0]);
  assert.deepEqual(allocate(50, [0, 0]), [0, 0]);
});

test("grand total equals subtotal - discount + delivery (tax-inclusive)", () => {
  const inv = buildInvoice({
    ...base,
    items: [{ name: "Truffle cake", price: 899, qty: 1 }, { name: "Cookies", price: 349, qty: 3 }],
    delivery: 79,
    discount: 125,
  });
  assert.equal(inv.totals.gross, (899 + 349 * 3 - 125 + 79) * 100);
  assert.equal(inv.totals.discount, 12500);
});

test("intra-state splits CGST/SGST, tax + taxable = gross per line", () => {
  const inv = buildInvoice({ ...base, items: [{ name: "Cake", price: 1180, qty: 1 }], delivery: 0, discount: 0, placeOfSupplyState: "uttar  pradesh" });
  assert.equal(inv.intraState, true);
  const l = inv.lines[0];
  assert.equal(l.taxable, 100000);
  assert.equal(l.cgst, 9000);
  assert.equal(l.sgst, 9000);
  assert.equal(l.igst, 0);
  for (const x of inv.lines) assert.equal(x.taxable + x.cgst + x.sgst + x.igst, x.gross);
});

test("inter-state uses IGST only", () => {
  const inv = buildInvoice({ ...base, items: [{ name: "Cake", price: 1180, qty: 1 }], delivery: 0, discount: 0, placeOfSupplyState: "Delhi" });
  assert.equal(inv.intraState, false);
  assert.equal(inv.lines[0].igst, 18000);
  assert.equal(inv.lines[0].cgst + inv.lines[0].sgst, 0);
});

test("delivery is its own taxed line and not discounted", () => {
  const inv = buildInvoice({ ...base, items: [{ name: "Cake", price: 500, qty: 1 }], delivery: 79, discount: 100 });
  const d = inv.lines[inv.lines.length - 1];
  assert.equal(d.description, "Delivery charges");
  assert.equal(d.gross, 7900);
  assert.equal(inv.lines[0].gross, 40000);
});

test("odd amounts never leak a paisa", () => {
  const inv = buildInvoice({ ...base, items: [{ name: "A", price: 333, qty: 3 }, { name: "B", price: 77, qty: 1 }], delivery: 79, discount: 99 });
  for (const x of inv.lines) assert.equal(x.taxable + x.cgst + x.sgst + x.igst, x.gross);
  assert.equal(inv.totals.gross, (999 + 77 - 99 + 79) * 100);
});

test("financial year rolls over on 1 April IST", () => {
  assert.equal(financialYear(new Date("2026-03-31T10:00:00Z")), "25-26");
  assert.equal(financialYear(new Date("2026-03-31T19:00:00Z")), "26-27"); // 00:30 IST on 1 Apr
  assert.equal(invoiceNumber("64b0c0ffee00000000abc123", new Date("2026-08-01T00:00:00Z")), "TTM/26-27/ABC123");
});

test("gstConfig: defaults, GSTIN uppercased, bad rate falls back", () => {
  assert.equal(gstConfig({}).gstin, null);
  assert.equal(gstConfig({ GST_GSTIN: " 09abcde1234f1z5 " }).gstin, "09ABCDE1234F1Z5");
  assert.equal(gstConfig({ GST_RATE_PERCENT: "5" }).ratePercent, 5);
  assert.equal(gstConfig({ GST_RATE_PERCENT: "abc" }).ratePercent, 18);
});
