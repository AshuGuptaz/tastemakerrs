import { NextResponse } from "next/server";
import { z } from "zod";
import { emailConfigured, sendEmail } from "@/lib/notify";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { logError, logInfo } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Per-IP rate limit: max 5 contact submissions per 10 minutes (shared MongoDB
// store — works across serverless instances, unlike the old in-memory Map).
const CONTACT_MAX = 5;
const CONTACT_WINDOW_MS = 10 * 60_000;

const Body = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional().default(""),
  message: z.string().min(1).max(2000),
});

const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export async function POST(req: Request) {
  const rl = await rateLimit(`contact:${clientIp(req)}`, { limit: CONTACT_MAX, windowMs: CONTACT_WINDOW_MS });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let data: z.infer<typeof Body>;
  try {
    data = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Please add your name, a valid email, and a message." }, { status: 400 });
  }

  const to = process.env.CONTACT_TO || "tastemakerrs@gmail.com";

  if (emailConfigured()) {
    const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0B0B0C;">
      <h2 style="margin:0 0 12px;">New enquiry — The Taste Makerrs</h2>
      <p style="margin:0 0 4px;"><b>Name:</b> ${esc(data.name)}</p>
      <p style="margin:0 0 4px;"><b>Email:</b> ${esc(data.email)}</p>
      ${data.phone ? `<p style="margin:0 0 4px;"><b>Phone:</b> ${esc(data.phone)}</p>` : ""}
      <p style="margin:12px 0 4px;"><b>Message:</b></p>
      <p style="margin:0;white-space:pre-wrap;background:#FFF9F1;border-radius:12px;padding:14px;">${esc(data.message)}</p>
    </div>`;
    const r = await sendEmail({
      to,
      replyTo: data.email,
      subject: `New enquiry from ${data.name}`,
      html,
      text: `${data.name} <${data.email}> ${data.phone}\n\n${data.message}`,
    });
    if ("ok" in r && !r.ok) {
      logError("contact/POST", new Error("email send failed"), { to });
      return NextResponse.json({ error: "We couldn't send that right now — please WhatsApp us." }, { status: 502 });
    }
  } else {
    // No email provider configured — log so the message isn't silently lost in dev.
    logInfo("contact/POST", "no email provider configured; enquiry not delivered", { from: data.email });
  }

  return NextResponse.json({ ok: true });
}
