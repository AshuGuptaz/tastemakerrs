/**
 * Notifications — email (Resend) + SMS (pluggable adapter).
 *
 * Everything degrades gracefully: if a channel isn't configured it logs and
 * skips instead of throwing, so the app keeps working before keys are added.
 *
 * Env:
 *   RESEND_API_KEY, RESEND_FROM            — email (RESEND_FROM defaults to Resend's test sender)
 *   One SMS provider (auto-detected):
 *     TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM
 *     MSG91_AUTHKEY / MSG91_SENDER (DLT)   — India
 *     FAST2SMS_API_KEY                     — India
 *   SMS_COUNTRY_CODE                       — default "91"
 */
import { whatsappLink } from "./site";

import { logError, logWarn } from "@/lib/logger";

const BRAND = "The Taste Makerrs";
const ACCENT = "#6A2A1B"; // brand v5 cocoa
const INK = "#2A140D";

export function emailConfigured() {
  return !!process.env.RESEND_API_KEY;
}
export function smsConfigured() {
  return !!(
    (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) ||
    process.env.MSG91_AUTHKEY ||
    process.env.FAST2SMS_API_KEY
  );
}
/** OTP is only enforced once a real channel exists; in dev it's always on (codes returned for testing). */
export function otpEnabled() {
  return process.env.NODE_ENV !== "production" || emailConfigured() || smsConfigured();
}

/**
 * Hard cap on any provider call. These are awaited inside request handlers (OTP
 * send, payment verify/webhook, status updates) — a hung Resend/Twilio/Fast2SMS
 * would otherwise stall the whole request until the platform kills it, and a
 * killed /api/razorpay/verify tells the customer "verification failed" for an
 * order that was already marked paid. On timeout the call resolves {ok:false}
 * like any other delivery failure (callers already handle that).
 */
const PROVIDER_TIMEOUT_MS = 6000;
const providerSignal = () => AbortSignal.timeout(PROVIDER_TIMEOUT_MS);

/* ───────────────────────────── Email (Resend) ───────────────────────────── */

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    logWarn("notify/email", `skipped (no RESEND_API_KEY): "${opts.subject}" → ${opts.to}`);
    return { skipped: true as const };
  }
  const from = process.env.RESEND_FROM || `${BRAND} <onboarding@resend.dev>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text, ...(opts.replyTo ? { reply_to: opts.replyTo } : {}) }),
      signal: providerSignal(),
    });
    if (!res.ok) {
      const body = await res.text();
      logError("notify/email", new Error(`Resend failed (${res.status}): ${body}`));
      return { ok: false as const, error: body };
    }
    return { ok: true as const };
  } catch (e: unknown) {
    logError("notify/email", e);
    return { ok: false as const, error: e instanceof Error ? e.message : String(e) };
  }
}

/* ───────────────────────────── SMS (pluggable) ──────────────────────────── */

function withCountryCode(phone: string) {
  const cc = process.env.SMS_COUNTRY_CODE || "91";
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith(cc) && digits.length > 10) return `+${digits}`;
  return `+${cc}${digits}`;
}

export async function sendSMS(opts: { to: string; body: string }) {
  const to = withCountryCode(opts.to);

  // Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM) {
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ From: process.env.TWILIO_FROM!, To: to, Body: opts.body }),
        signal: providerSignal(),
      });
      if (!res.ok) { logError("notify/sms/twilio", new Error(await res.text())); return { ok: false as const }; }
      return { ok: true as const };
    } catch (e: unknown) { logError("notify/sms/twilio", e); return { ok: false as const }; }
  }

  // Fast2SMS (India) — always returns HTTP 200; real success/failure is in body.return
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: { authorization: process.env.FAST2SMS_API_KEY!, "Content-Type": "application/json" },
        body: JSON.stringify({
          route: "q",
          message: opts.body,
          numbers: opts.to.replace(/\D/g, "").slice(-10),
          flash: 0,
        }),
        signal: providerSignal(),
      });
      const data = await res.json();
      if (!data.return) {
        logError("notify/sms/fast2sms", new Error(JSON.stringify(data)));
        return { ok: false as const };
      }
      return { ok: true as const };
    } catch (e: unknown) { logError("notify/sms/fast2sms", e); return { ok: false as const }; }
  }

  // MSG91 (India) — generic SMS API
  if (process.env.MSG91_AUTHKEY) {
    try {
      const res = await fetch("https://api.msg91.com/api/v5/flow/", {
        method: "POST",
        headers: { authkey: process.env.MSG91_AUTHKEY!, "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: process.env.MSG91_SENDER || "TSTMKR",
          short_url: "0",
          mobiles: to.replace("+", ""),
          message: opts.body,
        }),
        signal: providerSignal(),
      });
      if (!res.ok) { logError("notify/sms/msg91", new Error(await res.text())); return { ok: false as const }; }
      return { ok: true as const };
    } catch (e: unknown) { logError("notify/sms/msg91", e); return { ok: false as const }; }
  }

  logWarn("notify/sms", `skipped (no provider) → ${to.slice(-4)}… : ${opts.body.slice(0, 40)}…`);
  return { skipped: true as const };
}

/* ───────────────────────────── Templates ────────────────────────────────── */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thetastemakerrs.com";

/** wa.me link prefilled with the order ref so the team knows which order a message is about. */
function orderWhatsappUrl(id: string) {
  return whatsappLink(`Hi, I have a question about my order #${id.slice(-8).toUpperCase()}`);
}

function shell(inner: string) {
  return `<!doctype html><html><body style="margin:0;background:#FBF5EA;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${SITE_URL}" style="display:inline-block;">
        <img
          src="${SITE_URL}/brand/v5/lockup-horizontal.png"
          alt="The Taste Makerrs"
          width="220"
          height="59"
          style="display:block;border:0;max-width:220px;height:auto;"
        />
      </a>
    </div>
    <div style="background:#fff;border:1px solid #EBDCC3;border-radius:24px;padding:32px;box-shadow:0 10px 30px -12px rgba(106,42,27,.14);">
      ${inner}
    </div>
    <p style="text-align:center;color:#7A5A4C;font-size:12px;margin-top:18px;">Baked fresh in Lucknow, delivered with love. 🤎</p>
  </div></body></html>`;
}

export function otpEmailTemplate(code: string, name?: string) {
  return shell(`
    <h1 style="margin:0 0 6px;font-size:22px;">Hi ${name ? escapeHtml(name) : "there"} 👋</h1>
    <p style="margin:0 0 22px;color:#4E3127;font-size:15px;">Here's your verification code to confirm your order. It's valid for <b>10 minutes</b>.</p>
    <div style="text-align:center;margin:8px 0 22px;">
      <div style="display:inline-block;font-size:38px;font-weight:800;letter-spacing:10px;color:${ACCENT};background:#FAEFDB;border:1px dashed ${ACCENT};border-radius:16px;padding:16px 24px;">${code}</div>
    </div>
    <p style="margin:0;color:#7A5A4C;font-size:13px;">Never share this code with anyone — not even with us. If you didn't request it, you can ignore this email.</p>
  `);
}

export function orderEmailTemplate(order: {
  id: string;
  name: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  address: { street: string; city: string; state: string; pincode: string };
  schedule?: string; // "Sat, 9 Aug 2026 · 3 – 6 PM"
  gift?: { recipientName?: string };
}) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;color:${INK};">${escapeHtml(i.name)} <span style="color:#A88B7A;">× ${i.qty}</span></td><td style="padding:8px 0;text-align:right;font-weight:600;">₹${i.qty * i.price}</td></tr>`
    )
    .join("");
  return shell(`
    <div style="text-align:center;margin-bottom:18px;">
      <div style="font-size:40px;line-height:1;">🎂</div>
      <h1 style="margin:12px 0 4px;font-size:24px;">Your order is confirmed!</h1>
      <p style="margin:0;color:#4E3127;font-size:15px;">Thank you, ${escapeHtml(order.name)} — we're already preheating the oven.</p>
    </div>
    <div style="background:#FDF7EC;border-radius:16px;padding:16px 18px;margin-bottom:16px;">
      <div style="font-size:12px;color:#7A5A4C;text-transform:uppercase;letter-spacing:.12em;font-weight:700;">Order</div>
      <div style="font-size:15px;font-weight:700;">#${order.id.slice(-8).toUpperCase()}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:15px;">${rows}</table>
    <div style="border-top:1px solid #EBDCC3;margin-top:12px;padding-top:12px;font-size:14px;color:#4E3127;">
      <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><span>₹${order.subtotal}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>Delivery</span><span>${order.delivery === 0 ? "FREE" : "₹" + order.delivery}</span></div>
      ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;color:${ACCENT};"><span>Discount</span><span>− ₹${order.discount}</span></div>` : ""}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:2px solid ${INK};margin-top:10px;padding-top:10px;">
      <span style="font-weight:800;font-size:16px;">Total</span>
      <span style="font-weight:800;font-size:22px;color:${ACCENT};">₹${order.total}</span>
    </div>
    ${order.schedule ? `<div style="margin:18px 0 0;padding:12px 14px;background:#FAEFDB;border-radius:12px;font-size:14px;color:${INK};">🗓️ <b>Scheduled delivery:</b> ${escapeHtml(order.schedule)}</div>` : ""}
    ${order.gift?.recipientName ? `<p style="margin:12px 0 0;color:${ACCENT};font-size:14px;">🎁 This is a gift for ${escapeHtml(order.gift.recipientName)} — we'll pack it with your note.</p>` : ""}
    <p style="margin:18px 0 0;color:#4E3127;font-size:14px;">Delivering to: ${escapeHtml(order.address.street)}, ${escapeHtml(order.address.city)}, ${escapeHtml(order.address.state)} ${escapeHtml(order.address.pincode)}.</p>
    <p style="margin:8px 0 0;color:#7A5A4C;font-size:13px;">We'll be in touch with delivery updates. Questions? Reply to this email or <a href="${orderWhatsappUrl(order.id)}" style="color:#25D366;font-weight:700;text-decoration:none;">message us on WhatsApp</a>.</p>
  `);
}

export function otpSmsTemplate(code: string) {
  return `${code} is your ${BRAND} verification code. Valid 10 min. Never share it. 🧁`;
}

/* ── Occasion reminders (birthdays / anniversaries) ── */

export function occasionReminderEmailTemplate(o: {
  greetingName?: string;
  label: string;
  recipientName?: string;
  dateText: string; // "Sat, 9 Aug"
  daysAway: number;
  code?: string;
}) {
  const who = o.recipientName ? escapeHtml(o.recipientName) + "’s" : "a special";
  const when = o.daysAway <= 0 ? "today" : o.daysAway === 1 ? "tomorrow" : `in ${o.daysAway} days`;
  return shell(`
    <div style="text-align:center;margin-bottom:16px;">
      <div style="font-size:40px;line-height:1;">🎉</div>
      <h1 style="margin:12px 0 4px;font-size:23px;">${who} ${escapeHtml(o.label)} is coming up!</h1>
      <p style="margin:0;color:#4E3127;font-size:15px;">Hi ${o.greetingName ? escapeHtml(o.greetingName) : "there"} — it&apos;s ${when} (${escapeHtml(o.dateText)}). Beat the rush and order a fresh, hand-finished cake now.</p>
    </div>
    ${o.code ? `<div style="text-align:center;margin:8px 0 18px;"><div style="display:inline-block;font-size:15px;font-weight:700;color:${ACCENT};background:#FAEFDB;border:1px dashed ${ACCENT};border-radius:12px;padding:10px 18px;">Use code ${escapeHtml(o.code)} at checkout</div></div>` : ""}
    <div style="text-align:center;">
      <a href="${SITE_URL}/menu" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;font-weight:700;font-size:15px;border-radius:999px;padding:13px 26px;">Order a cake →</a>
    </div>
    <p style="margin:18px 0 0;color:#7A5A4C;font-size:12px;text-align:center;">You&apos;re getting this because you saved this occasion in your account. Manage reminders anytime in your account.</p>
  `);
}

export function occasionReminderSmsTemplate(o: { label: string; recipientName?: string; daysAway: number; code?: string }) {
  const who = o.recipientName ? `${o.recipientName}'s` : "a special";
  const when = o.daysAway <= 0 ? "today" : o.daysAway === 1 ? "tomorrow" : `in ${o.daysAway} days`;
  return `🎉 ${who} ${o.label} is ${when}! Order a fresh ${BRAND} cake now${o.code ? ` — use ${o.code}` : ""}. ${SITE_URL}/menu 🎂`;
}
export function orderSmsTemplate(id: string, total: number) {
  return `Yay! Your ${BRAND} order #${id.slice(-8).toUpperCase()} is confirmed 🎂 Total ₹${total}. We're baking it fresh and will deliver soon. Thank you! 🧡`;
}

/* ── Order status updates (live tracking) ── */

export function orderStatusEmailTemplate(o: {
  id: string;
  name: string;
  label: string;
  blurb: string;
  emoji: string;
  trackUrl: string;
}) {
  return shell(`
    <div style="text-align:center;margin-bottom:16px;">
      <div style="font-size:40px;line-height:1;">${o.emoji}</div>
      <h1 style="margin:12px 0 4px;font-size:23px;">${escapeHtml(o.label)}</h1>
      <p style="margin:0;color:#4E3127;font-size:15px;">Hi ${escapeHtml(o.name)} — ${escapeHtml(o.blurb)}</p>
    </div>
    <div style="background:#FDF7EC;border-radius:16px;padding:14px 16px;margin-bottom:16px;text-align:center;">
      <div style="font-size:12px;color:#7A5A4C;text-transform:uppercase;letter-spacing:.12em;font-weight:700;">Order</div>
      <div style="font-size:15px;font-weight:700;">#${o.id.slice(-8).toUpperCase()}</div>
    </div>
    <div style="text-align:center;">
      <a href="${o.trackUrl}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;font-weight:700;font-size:15px;border-radius:999px;padding:13px 26px;">Track your order →</a>
    </div>
    <p style="margin:18px 0 0;text-align:center;color:#7A5A4C;font-size:13px;">Questions? <a href="${orderWhatsappUrl(o.id)}" style="color:#25D366;font-weight:700;text-decoration:none;">Message us on WhatsApp</a></p>
  `);
}

/** One-time "you left something in your cart" email. Includes a one-click unsubscribe. */
export function cartReminderEmailTemplate(o: {
  name?: string;
  items: { name: string; qty: number; price: number }[];
  cartUrl: string;
  unsubUrl: string;
}) {
  const shown = o.items.slice(0, 4);
  const more = o.items.length - shown.length;
  const rows = shown
    .map(
      (i) =>
        `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #EBDCC3;font-size:15px;"><span>${escapeHtml(i.name)}${i.qty > 1 ? ` × ${i.qty}` : ""}</span><span style="font-weight:700;">₹${i.price * i.qty}</span></div>`
    )
    .join("");
  return shell(`
    <div style="text-align:center;margin-bottom:16px;">
      <div style="font-size:40px;line-height:1;">🎂</div>
      <h1 style="margin:12px 0 4px;font-size:23px;">You left something sweet behind</h1>
      <p style="margin:0;color:#4E3127;font-size:15px;">${o.name ? `Hi ${escapeHtml(o.name)} — your` : "Your"} cart is saved and waiting.</p>
    </div>
    <div style="background:#FDF7EC;border-radius:16px;padding:6px 16px;margin-bottom:8px;">${rows}${more > 0 ? `<div style="padding:8px 0;font-size:13px;color:#7A5A4C;">+ ${more} more item${more > 1 ? "s" : ""}</div>` : ""}</div>
    <p style="margin:12px 0 18px;text-align:center;color:#4E3127;font-size:14px;">Order before 12 noon for same-day delivery in Lucknow.</p>
    <div style="text-align:center;">
      <a href="${o.cartUrl}" style="display:inline-block;background:${ACCENT};color:#fff;text-decoration:none;font-weight:700;font-size:15px;border-radius:999px;padding:13px 26px;">Complete my order →</a>
    </div>
    <p style="margin:18px 0 0;text-align:center;color:#7A5A4C;font-size:13px;">Need help choosing? <a href="${whatsappLink("Hi, I need help with my order")}" style="color:#25D366;font-weight:700;text-decoration:none;">Message us on WhatsApp</a></p>
    <p style="margin:14px 0 0;text-align:center;color:#A88B7A;font-size:12px;">We'll only send this once. <a href="${o.unsubUrl}" style="color:#A88B7A;">Stop cart reminders</a></p>
  `);
}

export function orderStatusSmsTemplate(o: { id: string; emoji: string; label: string; trackUrl: string }) {
  return `${o.emoji} ${BRAND} order #${o.id.slice(-8).toUpperCase()}: ${o.label}. Track it: ${o.trackUrl}`;
}

/** Staff-facing (not customer-facing) — a custom-cake quote request just came in. */
export function customOrderAdminEmailTemplate(order: {
  name: string;
  phone: string;
  email?: string;
  flavor: string;
  weight: string;
  shape: string;
  eggless: boolean;
  message?: string;
  date: string;
  price: number;
  hasImage: boolean;
}) {
  return shell(`
    <h1 style="margin:0 0 6px;font-size:22px;">🎂 New custom cake request</h1>
    <p style="margin:0 0 18px;color:#4E3127;font-size:15px;">From <b>${escapeHtml(order.name)}</b> — call or WhatsApp to confirm details and quote.</p>
    <table style="width:100%;border-collapse:collapse;font-size:15px;">
      <tr><td style="padding:6px 0;color:#7A5A4C;">Flavor</td><td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(order.flavor)}</td></tr>
      <tr><td style="padding:6px 0;color:#7A5A4C;">Weight</td><td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(order.weight)}</td></tr>
      <tr><td style="padding:6px 0;color:#7A5A4C;">Shape</td><td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(order.shape)}</td></tr>
      <tr><td style="padding:6px 0;color:#7A5A4C;">Eggless</td><td style="padding:6px 0;text-align:right;font-weight:600;">${order.eggless ? "Yes" : "No"}</td></tr>
      <tr><td style="padding:6px 0;color:#7A5A4C;">Delivery date</td><td style="padding:6px 0;text-align:right;font-weight:600;">${escapeHtml(order.date)}</td></tr>
      <tr><td style="padding:6px 0;color:#7A5A4C;">Est. price</td><td style="padding:6px 0;text-align:right;font-weight:600;">₹${order.price}</td></tr>
      ${order.hasImage ? `<tr><td style="padding:6px 0;color:#7A5A4C;">Reference photo</td><td style="padding:6px 0;text-align:right;font-weight:600;">Attached ✓ (view in DB)</td></tr>` : ""}
    </table>
    ${order.message ? `<p style="margin:14px 0 0;padding:12px 14px;background:#FDF7EC;border-radius:12px;font-size:14px;color:${INK};">"${escapeHtml(order.message)}"</p>` : ""}
    <div style="border-top:1px solid #EBDCC3;margin-top:16px;padding-top:14px;font-size:14px;color:#4E3127;">
      <p style="margin:0 0 4px;"><b>Phone:</b> <a href="tel:+91${escapeHtml(order.phone)}">${escapeHtml(order.phone)}</a></p>
      ${order.email ? `<p style="margin:0;"><b>Email:</b> <a href="mailto:${escapeHtml(order.email)}">${escapeHtml(order.email)}</a></p>` : ""}
    </div>
  `);
}

export function customOrderAdminSmsTemplate(order: { name: string; phone: string; flavor: string; weight: string; date: string }) {
  return `New custom cake request: ${order.name} (${order.phone}) wants ${order.flavor}, ${order.weight}, for ${order.date}. Check email for full details.`;
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
