import { test } from "node:test";
import assert from "node:assert/strict";
import { decideRazorpayOrder, hasRazorpayOrderId, matchRazorpayOrderId } from "../lib/razorpay-order";

test("no previous Razorpay order → create", () => assert.equal(decideRazorpayOrder(null, 72900), "create"));

test("still payable and same amount → reuse (no stray second order)", () => {
  assert.equal(decideRazorpayOrder({ id: "o1", status: "created", amount: 72900 }, 72900), "reuse");
  assert.equal(decideRazorpayOrder({ id: "o1", status: "attempted", amount: 72900 }, 72900), "reuse");
});

test("amount changed since → must create a new one (can't reuse a different amount)", () => {
  assert.equal(decideRazorpayOrder({ id: "o1", status: "created", amount: 50000 }, 72900), "create");
});

test("already paid on Razorpay's side → never create another (would invite a double payment)", () => {
  assert.equal(decideRazorpayOrder({ id: "o1", status: "paid", amount: 72900 }, 72900), "already_paid");
  assert.equal(decideRazorpayOrder({ id: "o1", status: "paid", amount: 1 }, 72900), "already_paid");
});

test("unknown/other status → create", () => assert.equal(decideRazorpayOrder({ id: "o1", status: "expired", amount: 72900 }, 72900), "create"));

test("matches current id OR any earlier attempt (the late-UPI case)", () => {
  const order = { razorpayOrderId: "new", razorpayOrderIds: ["old", "new"] };
  assert.equal(hasRazorpayOrderId(order, "new"), true);
  assert.equal(hasRazorpayOrderId(order, "old"), true);
  assert.equal(hasRazorpayOrderId(order, "other"), false);
  // legacy orders created before this change only have the single field
  assert.equal(hasRazorpayOrderId({ razorpayOrderId: "legacy" }, "legacy"), true);
  assert.equal(hasRazorpayOrderId({}, "x"), false);
  assert.deepEqual(matchRazorpayOrderId("x"), { $or: [{ razorpayOrderId: "x" }, { razorpayOrderIds: "x" }] });
});
