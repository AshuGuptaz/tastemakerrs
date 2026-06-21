/**
 * Transactional email via the Resend REST API. Fully env-gated: if
 * RESEND_API_KEY or EMAIL_FROM is missing, every send is a logged no-op.
 * No call ever throws into the caller.
 */
import { logger, captureError } from "./logger";

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    logger.info("email skipped (not configured)", { to: opts.to, subject: opts.subject });
    return;
  }
  if (!opts.to) {
    logger.info("email skipped (no recipient)", { subject: opts.subject });
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        ...(opts.text ? { text: opts.text } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      logger.warn("email send failed", { to: opts.to, status: res.status, body });
      return;
    }
    logger.info("email sent", { to: opts.to, subject: opts.subject });
  } catch (err) {
    captureError(err, { scope: "email.send", to: opts.to, subject: opts.subject });
  }
}

function money(n: unknown): string {
  const v = Number(n);
  return Number.isFinite(v) ? `₹${v}` : escapeHtml(n);
}

function renderItems(items: any[]): string {
  if (!Array.isArray(items) || items.length === 0) return "<p>No items.</p>";
  const rows = items
    .map((it) => {
      const name = escapeHtml(it?.name ?? it?.title ?? "Item");
      const qty = escapeHtml(it?.qty ?? it?.quantity ?? 1);
      const price = money(it?.price);
      return `<tr><td>${name}</td><td>${qty}</td><td>${price}</td></tr>`;
    })
    .join("");
  return `<table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse">
    <thead><tr><th align="left">Item</th><th align="left">Qty</th><th align="left">Price</th></tr></thead>
    <tbody>${rows}</tbody></table>`;
}

function renderAddress(address: any): string {
  if (!address) return "";
  const parts = [
    address.name,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
    address.phone,
  ]
    .filter(Boolean)
    .map(escapeHtml);
  return parts.join("<br/>");
}

export async function sendOrderConfirmation(order: any): Promise<void> {
  try {
    const to = order?.address?.email;
    const orderNo = escapeHtml(order?.orderNumber ?? order?._id ?? "");
    const total = money(order?.total);
    const html = `
      <h2>Thanks for your order!</h2>
      <p>Order <strong>${orderNo}</strong></p>
      ${renderItems(order?.items)}
      <p><strong>Total: ${total}</strong></p>
      <h3>Delivery address</h3>
      <p>${renderAddress(order?.address)}</p>
      <p>— The Taste Makerrs</p>`;
    const text = `Thanks for your order!\nOrder ${order?.orderNumber ?? order?._id ?? ""}\nTotal: ${order?.total ?? ""}`;
    await sendEmail({ to, subject: `Your order ${order?.orderNumber ?? ""} is confirmed`, html, text });
  } catch (err) {
    captureError(err, { scope: "email.sendOrderConfirmation" });
  }
}

export async function sendAdminOrderAlert(order: any): Promise<void> {
  try {
    const to = process.env.ADMIN_EMAIL || "";
    const orderNo = escapeHtml(order?.orderNumber ?? order?._id ?? "");
    const total = money(order?.total);
    const html = `
      <h2>New order received</h2>
      <p>Order <strong>${orderNo}</strong> — ${total}</p>
      ${renderItems(order?.items)}
      <h3>Customer</h3>
      <p>${renderAddress(order?.address)}</p>`;
    await sendEmail({ to, subject: `New order ${order?.orderNumber ?? ""} (${total})`, html });
  } catch (err) {
    captureError(err, { scope: "email.sendAdminOrderAlert" });
  }
}

export async function sendContactMessage(m: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  try {
    const to = process.env.ADMIN_EMAIL || "";
    const html = `
      <h2>New contact message</h2>
      <p><strong>Name:</strong> ${escapeHtml(m?.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(m?.email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(m?.message)}</p>`;
    await sendEmail({ to, subject: `Contact message from ${m?.name ?? "visitor"}`, html });
  } catch (err) {
    captureError(err, { scope: "email.sendContactMessage" });
  }
}
