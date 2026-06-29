import { NextResponse } from "next/server";
import { z } from "zod";
import { emailConfigured, sendEmail } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  message: z.string().min(1),
});

const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

export async function POST(req: Request) {
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
      return NextResponse.json({ error: "We couldn't send that right now — please WhatsApp us." }, { status: 502 });
    }
  } else {
    // No email provider configured — log so the message isn't silently lost in dev.
    console.log("[contact]", data);
  }

  return NextResponse.json({ ok: true });
}
