import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { sendContactMessage } from "@/lib/email";

const MAX_BYTES = 2_000_000;

const contactSchema = z.object({
  name: z.string().max(200),
  email: z.string().email().max(320),
  message: z.string().max(2000),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { ok } = await rateLimit(`contact:${ip}`, 5, 60_000);
  if (!ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Size guard before parsing.
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  try {
    const raw = await req.text();
    if (raw.length > MAX_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const body = JSON.parse(raw);
    const parsed = contactSchema.parse(body);

    await sendContactMessage({
      name: parsed.name,
      email: parsed.email,
      message: parsed.message,
    });
    console.log("[contact] message received");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
