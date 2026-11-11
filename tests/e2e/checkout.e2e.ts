/**
 * End-to-end checkout test — the revenue path: cart → checkout form → place
 * order → (mock) Razorpay → verify → /order-success.
 *
 * Run:  npm run test:e2e
 *   - against a running server:  E2E_BASE_URL=http://localhost:3000 npm run test:e2e
 *   - otherwise it boots `next dev` on :3101 itself.
 *
 * Every network dependency is mocked at the browser (page.route): our own order /
 * payment / OTP / track APIs, the Razorpay checkout script (replaced with a stub
 * whose modal either "pays" or "dismisses"), and Google Maps. So it needs NO
 * database, NO keys and can never move real money — it locks the CLIENT flow and
 * the request contract the server relies on (what /api/orders receives).
 *
 * Deliberately not under tests/*.test.ts so `npm test` (fast unit tests) stays fast.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { chromium, type Browser, type BrowserContext, type Page, type Route } from "playwright";
import { PRODUCTS } from "../../lib/products";
import { computeTotals, BUILTIN_COUPONS, discountForRule } from "../../lib/pricing";

const PORT = 3101;
const BASE = process.env.E2E_BASE_URL || `http://localhost:${PORT}`;
const ORDER_ID = "ord_e2e_123";
const product = PRODUCTS[0];
const SUBTOTAL = product.price; // qty 1

let browser: Browser;
let server: ChildProcess | null = null;

async function waitForServer(url: string, ms = 120_000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      if ((await fetch(url)).status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`server at ${url} did not start within ${ms}ms`);
}

before(async () => {
  if (!process.env.E2E_BASE_URL) {
    server = spawn("npx", ["next", "dev", "-p", String(PORT)], {
      stdio: "ignore",
      env: { ...process.env, NODE_ENV: "development" },
      detached: true,
    });
  }
  await waitForServer(BASE);
  browser = await chromium.launch();
}, { timeout: 150_000 });

after(async () => {
  await browser?.close();
  if (server?.pid) {
    try { process.kill(-server.pid); } catch {}
  }
});

// Stub for checkout.razorpay.com/v1/checkout.js. `window.__rzpMode` decides what
// the "modal" does when opened; the options it was opened with are kept for asserts.
const RAZORPAY_STUB = `
  window.Razorpay = function (opts) {
    this.on = function () {};
    this.open = function () {
      window.__rzpOpts = opts;
      window.__rzpOpened = (window.__rzpOpened || 0) + 1;
      if (window.__rzpMode === "dismiss") { opts.modal.ondismiss(); return; }
      setTimeout(function () {
        opts.handler({ razorpay_payment_id: "pay_e2e", razorpay_order_id: opts.order_id, razorpay_signature: "sig_e2e" });
      }, 50);
    };
  };
`;

type Mocks = { orderBodies: any[]; orderTotal?: number; verifyCalls: number; createOrderCalls: number };

async function newCheckoutPage(opts: { orderTotal?: number } = {}): Promise<{ ctx: BrowserContext; page: Page; m: Mocks }> {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const m: Mocks = { orderBodies: [], orderTotal: opts.orderTotal, verifyCalls: 0, createOrderCalls: 0 };

  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

  // third parties
  await page.route("https://checkout.razorpay.com/**", (r) => r.fulfill({ contentType: "text/javascript", body: RAZORPAY_STUB }));
  await page.route("https://maps.googleapis.com/**", (r) => r.fulfill({ contentType: "text/javascript", body: "" }));
  await page.route("https://www.googletagmanager.com/**", (r) => r.abort());

  // our APIs
  await page.route("**/api/otp/send", (r) => json(r, { enabled: false })); // OTP off → checkout skips straight to payment
  await page.route("**/api/orders", async (r) => {
    const body = r.request().postDataJSON();
    m.orderBodies.push(body);
    const t = computeTotals(
      body.items.reduce((s: number, i: any) => s + i.price * i.qty, 0),
      body.coupon
    );
    json(r, { id: ORDER_ID, subtotal: t.subtotal, delivery: t.delivery, discount: t.discount, total: m.orderTotal ?? t.total });
  });
  // Coupon validation mirrors the real endpoint using the built-in rules (no DB).
  await page.route("**/api/coupons/validate", (r) => {
    const { code, subtotal } = r.request().postDataJSON();
    const rule = BUILTIN_COUPONS.find((c) => c.code === String(code).toUpperCase());
    const discount = rule ? discountForRule(rule, subtotal) : 0;
    if (!rule || discount <= 0) return json(r, { ok: false, error: "That coupon code isn't valid." });
    json(r, { ok: true, rule, discount, description: null });
  });
  await page.route("**/api/razorpay/create-order", (r) => {
    m.createOrderCalls++;
    json(r, { id: "order_rzp_e2e", amount: 0, currency: "INR" });
  });
  await page.route("**/api/razorpay/verify", (r) => { m.verifyCalls++; json(r, { ok: true }); });
  await page.route(`**/api/track/${ORDER_ID}`, (r) => json(r, { id: ORDER_ID, status: "confirmed" }));

  // seed a one-item cart before any page script runs
  await page.addInitScript(
    ([item]) => { try { localStorage.setItem("ttm_cart_v1", JSON.stringify([item])); } catch {} },
    [{ id: product.id, slug: product.slug, name: product.name, price: product.price, qty: 1 }]
  );

  await page.goto(`${BASE}/checkout`, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForSelector("#checkout-name", { timeout: 90_000 });
  return { ctx, page, m };
}

async function fillForm(page: Page) {
  await page.fill("#checkout-name", "Test Customer");
  await page.fill("#checkout-email", "test@example.com");
  await page.fill("#checkout-phone", "9876543210");
  await page.fill("#checkout-street", "12 MG Road, Indiranagar");
  await page.fill("#checkout-city", "Bengaluru");
  await page.fill("#checkout-state", "Karnataka");
  await page.fill("#checkout-pincode", "560038");
  // first bookable slot (the page rolls the date to tomorrow if today is closed)
  await page.locator("button[aria-pressed]:not([disabled])", { hasText: /\d/ }).first().click();
}

const payButton = (page: Page) => page.getByRole("button", { name: /^Pay ₹/ }).first();

test("happy path: pay → Razorpay → verify → order-success, cart cleared", async () => {
  const { ctx, page, m } = await newCheckoutPage();
  try {
    await page.evaluate(() => { (window as any).__rzpMode = "pay"; });
    await fillForm(page);
    await payButton(page).click();

    await page.waitForURL(`**/order-success?id=${ORDER_ID}`, { timeout: 30_000 });
    await page.getByRole("heading", { name: /confirmed/i }).waitFor({ timeout: 15_000 });

    // request contract: server reprices from productId — client sends ids + qty + totals it displayed
    assert.equal(m.orderBodies.length, 1, "exactly one order created");
    const body = m.orderBodies[0];
    assert.equal(body.items[0].productId, product.id);
    assert.equal(body.items[0].qty, 1);
    const t = computeTotals(SUBTOTAL, null);
    assert.equal(body.total, t.total, "client total matches pricing.ts");
    assert.equal(body.delivery, t.delivery);
    assert.equal(body.paymentMethod, "razorpay");
    assert.match(body.fulfillment.slot, /\S/, "a delivery slot was sent");
    assert.match(body.fulfillment.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(body.address.pincode, "560038");

    assert.equal(m.createOrderCalls, 1);
    assert.equal(m.verifyCalls, 1, "payment verified exactly once");

    const cart = await page.evaluate(() => localStorage.getItem("ttm_cart_v1"));
    assert.equal(JSON.parse(cart || "[]").length, 0, "cart cleared after confirmed payment");
  } finally {
    await ctx.close();
  }
});

test("empty/invalid form never creates an order", async () => {
  const { ctx, page, m } = await newCheckoutPage();
  try {
    await payButton(page).click();
    await page.waitForTimeout(800);
    assert.equal(m.orderBodies.length, 0, "validation blocks the order request");
    assert.match(new URL(page.url()).pathname, /\/checkout$/);
  } finally {
    await ctx.close();
  }
});

test("coupon FIRSTBITE: discount applied in the order request", async () => {
  const { ctx, page, m } = await newCheckoutPage();
  try {
    await page.evaluate(() => { (window as any).__rzpMode = "dismiss"; });
    await fillForm(page);
    await page.fill("#checkout-coupon", "firstbite");
    await page.getByRole("button", { name: /^apply$/i }).click();
    await payButton(page).click();
    await page.waitForFunction(() => (window as any).__rzpOpened === 1, null, { timeout: 30_000 });

    const t = computeTotals(SUBTOTAL, "FIRSTBITE");
    assert.ok(t.discount > 0, "sanity: coupon earns a discount on this product");
    const body = m.orderBodies[0];
    assert.equal(body.coupon, "FIRSTBITE");
    assert.equal(body.discount, t.discount);
    assert.equal(body.total, t.total);
  } finally {
    await ctx.close();
  }
});

test("price drift: server total differs → no payment modal, no charge", async () => {
  const t = computeTotals(SUBTOTAL, null);
  const { ctx, page, m } = await newCheckoutPage({ orderTotal: t.total + 50 });
  try {
    await page.evaluate(() => { (window as any).__rzpMode = "pay"; });
    await fillForm(page);
    await payButton(page).click();
    await page.getByText(/Prices have changed/i).waitFor({ timeout: 20_000 });

    assert.equal(m.createOrderCalls, 0, "must not create a Razorpay order on a price mismatch");
    assert.equal(await page.evaluate(() => (window as any).__rzpOpened || 0), 0, "modal never opened");
    // and the customer can try again (re-entry guard released)
    assert.equal(await payButton(page).isDisabled(), false);
  } finally {
    await ctx.close();
  }
});

test("dismissing the Razorpay modal keeps the cart and re-enables Pay", async () => {
  const { ctx, page, m } = await newCheckoutPage();
  try {
    await page.evaluate(() => { (window as any).__rzpMode = "dismiss"; });
    await fillForm(page);
    await payButton(page).click();
    await page.getByText(/Payment cancelled/i).waitFor({ timeout: 20_000 });

    assert.equal(m.verifyCalls, 0, "no verification without a payment");
    assert.match(new URL(page.url()).pathname, /\/checkout$/);
    assert.equal(await payButton(page).isDisabled(), false, "guard released so the customer can retry");
    const cart = JSON.parse((await page.evaluate(() => localStorage.getItem("ttm_cart_v1"))) || "[]");
    assert.equal(cart.length, 1, "cart untouched");
  } finally {
    await ctx.close();
  }
});

test("out-of-area pincode shows a notice but never blocks the order", async () => {
  const { ctx, page, m } = await newCheckoutPage();
  try {
    await page.evaluate(() => { (window as any).__rzpMode = "dismiss"; });
    await fillForm(page);
    await page.fill("#checkout-pincode", "560038"); // Bengaluru — outside the Lucknow range
    await page.getByText(/outside our usual Lucknow delivery area/i).waitFor({ timeout: 10_000 });
    await page.fill("#checkout-pincode", "226010"); // Lucknow — notice disappears
    await page.waitForFunction(() => !document.body.innerText.includes("outside our usual Lucknow delivery area"));
    await page.fill("#checkout-pincode", "560038");
    await payButton(page).click();
    await page.waitForFunction(() => (window as any).__rzpOpened === 1, null, { timeout: 30_000 });
    assert.equal(m.orderBodies.length, 1, "guidance only — the order is still created");
  } finally {
    await ctx.close();
  }
});

test("invalid coupon is rejected with a message; a valid one can be removed", async () => {
  const { ctx, page } = await newCheckoutPage();
  try {
    await page.fill("#checkout-coupon", "NOPE");
    await page.getByRole("button", { name: /^apply$/i }).click();
    await page.getByText(/isn't valid/i).waitFor({ timeout: 10_000 });
    assert.equal(await page.getByText("Discount", { exact: true }).count(), 0, "no discount for an invalid code");

    await page.fill("#checkout-coupon", "firstbite");
    await page.getByRole("button", { name: /^apply$/i }).click();
    await page.getByText("Discount", { exact: true }).waitFor({ timeout: 10_000 });
    await page.getByRole("button", { name: /^remove$/i }).click();
    await page.waitForFunction(() => !document.body.innerText.includes("Discount"));
  } finally {
    await ctx.close();
  }
});
