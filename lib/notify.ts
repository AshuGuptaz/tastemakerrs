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

const BRAND = "The Taste Makerrs";
const ACCENT = "#F97316";
const INK = "#0B0B0C";

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

/* ───────────────────────────── Email (Resend) ───────────────────────────── */

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[notify] email skipped (no RESEND_API_KEY): "${opts.subject}" → ${opts.to}`);
    return { skipped: true as const };
  }
  const from = process.env.RESEND_FROM || `${BRAND} <onboarding@resend.dev>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html, text: opts.text, ...(opts.replyTo ? { reply_to: opts.replyTo } : {}) }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[notify] Resend failed (${res.status}): ${body}`);
      return { ok: false as const, error: body };
    }
    return { ok: true as const };
  } catch (e: any) {
    console.error("[notify] Resend error:", e.message);
    return { ok: false as const, error: e.message };
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
      });
      if (!res.ok) { console.error("[notify] Twilio failed:", await res.text()); return { ok: false as const }; }
      return { ok: true as const };
    } catch (e: any) { console.error("[notify] Twilio error:", e.message); return { ok: false as const }; }
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
      });
      const data = await res.json();
      if (!data.return) {
        console.error("[notify] Fast2SMS failed:", JSON.stringify(data));
        return { ok: false as const };
      }
      return { ok: true as const };
    } catch (e: any) { console.error("[notify] Fast2SMS error:", e.message); return { ok: false as const }; }
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
      });
      if (!res.ok) { console.error("[notify] MSG91 failed:", await res.text()); return { ok: false as const }; }
      return { ok: true as const };
    } catch (e: any) { console.error("[notify] MSG91 error:", e.message); return { ok: false as const }; }
  }

  console.warn(`[notify] SMS skipped (no provider configured) → ${to}: ${opts.body.slice(0, 40)}…`);
  return { skipped: true as const };
}

/* ───────────────────────────── Templates ────────────────────────────────── */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thetastemakerrs.com";

function shell(inner: string) {
  return `<!doctype html><html><body style="margin:0;background:#FBF1E4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${SITE_URL}" style="display:inline-block;">
        <img
          src="${SITE_URL}/brand/logo-redesign-wordmark-full.png"
          alt="The Taste Makerrs"
          width="220"
          height="36"
          style="display:block;border:0;max-width:220px;height:auto;"
        />
      </a>
    </div>
    <div style="background:#fff;border:1px solid #F0E2CE;border-radius:24px;padding:32px;box-shadow:0 10px 30px -12px rgba(154,86,22,.18);">
      ${inner}
    </div>
    <p style="text-align:center;color:#9A7B57;font-size:12px;margin-top:18px;">Baked fresh in Lucknow, delivered with love. 🧡</p>
  </div></body></html>`;
}

export function otpEmailTemplate(code: string, name?: string) {
  return shell(`
    <h1 style="margin:0 0 6px;font-size:22px;">Hi ${name ? escapeHtml(name) : "there"} 👋</h1>
    <p style="margin:0 0 22px;color:#5b5b62;font-size:15px;">Here's your verification code to confirm your order. It's valid for <b>10 minutes</b>.</p>
    <div style="text-align:center;margin:8px 0 22px;">
      <div style="display:inline-block;font-size:38px;font-weight:800;letter-spacing:10px;color:${ACCENT};background:#FFF4E6;border:1px dashed ${ACCENT};border-radius:16px;padding:16px 24px;">${code}</div>
    </div>
    <p style="margin:0;color:#9A7B57;font-size:13px;">Never share this code with anyone — not even with us. If you didn't request it, you can ignore this email.</p>
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
}) {
  const rows = order.items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;color:${INK};">${escapeHtml(i.name)} <span style="color:#b09b80;">× ${i.qty}</span></td><td style="padding:8px 0;text-align:right;font-weight:600;">₹${i.qty * i.price}</td></tr>`
    )
    .join("");
  return shell(`
    <div style="text-align:center;margin-bottom:18px;">
      <div style="font-size:40px;line-height:1;">🎂</div>
      <h1 style="margin:12px 0 4px;font-size:24px;">Your order is confirmed!</h1>
      <p style="margin:0;color:#5b5b62;font-size:15px;">Thank you, ${escapeHtml(order.name)} — we're already preheating the oven.</p>
    </div>
    <div style="background:#FFF9F1;border-radius:16px;padding:16px 18px;margin-bottom:16px;">
      <div style="font-size:12px;color:#9A7B57;text-transform:uppercase;letter-spacing:.12em;font-weight:700;">Order</div>
      <div style="font-size:15px;font-weight:700;">#${order.id.slice(-8).toUpperCase()}</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:15px;">${rows}</table>
    <div style="border-top:1px solid #F0E2CE;margin-top:12px;padding-top:12px;font-size:14px;color:#5b5b62;">
      <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><span>₹${order.subtotal}</span></div>
      <div style="display:flex;justify-content:space-between;"><span>Delivery</span><span>${order.delivery === 0 ? "FREE" : "₹" + order.delivery}</span></div>
      ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;color:${ACCENT};"><span>Discount</span><span>− ₹${order.discount}</span></div>` : ""}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:baseline;border-top:2px solid ${INK};margin-top:10px;padding-top:10px;">
      <span style="font-weight:800;font-size:16px;">Total</span>
      <span style="font-weight:800;font-size:22px;color:${ACCENT};">₹${order.total}</span>
    </div>
    <p style="margin:18px 0 0;color:#5b5b62;font-size:14px;">Delivering to: ${escapeHtml(order.address.street)}, ${escapeHtml(order.address.city)}, ${escapeHtml(order.address.state)} ${escapeHtml(order.address.pincode)}.</p>
    <p style="margin:8px 0 0;color:#9A7B57;font-size:13px;">We'll be in touch on WhatsApp with delivery updates. Questions? Just reply to this email.</p>
  `);
}

export function otpSmsTemplate(code: string) {
  return `${code} is your ${BRAND} verification code. Valid 10 min. Never share it. 🧁`;
}
export function orderSmsTemplate(id: string, total: number) {
  return `Yay! Your ${BRAND} order #${id.slice(-8).toUpperCase()} is confirmed 🎂 Total ₹${total}. We're baking it fresh and will deliver soon. Thank you! 🧡`;
}

function escapeHtml(s: string) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
