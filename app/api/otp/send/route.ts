import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Otp } from "@/models/Otp";
import { hashCode } from "@/lib/checkout-token";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import {
  otpEnabled,
  emailConfigured,
  smsConfigured,
  sendEmail,
  sendSMS,
  otpEmailTemplate,
  otpSmsTemplate,
} from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  name: z.string().optional(),
});

const COOLDOWN_MS = 30_000;
const MAX_PER_HOUR = 6;
const CODE_TTL_MS = 10 * 60_000; // code validity
const RATE_WINDOW_MS = 3600_000; // 1 h — also the row TTL, so counting works

export async function POST(req: Request) {
  try {
    const { email, phone, name } = Body.parse(await req.json());

    // If no delivery channel is configured in production, OTP is off — tell the
    // client to proceed without it so checkout never breaks before keys are set.
    if (!otpEnabled()) {
      return NextResponse.json({ enabled: false });
    }

    // Per-IP layer on top of the per-phone/email caps below — blunts a single
    // source rotating identities to spray codes. Shared MongoDB store.
    const ipRl = await rateLimit(`otp-ip:${clientIp(req)}`, { limit: 12, windowMs: RATE_WINDOW_MS });
    if (!ipRl.allowed) {
      return NextResponse.json(
        { error: "Too many codes requested. Try again later." },
        { status: 429, headers: { "Retry-After": String(ipRl.retryAfter) } }
      );
    }

    await connectDB();
    const emailLc = email.trim().toLowerCase();
    const now = Date.now();

    // Hourly cap, atomic per identifier — phone AND email are each checked
    // independently via rateLimit()'s single atomic increment, so concurrent
    // requests can't all read a stale count before any of them commits (the
    // way a plain countDocuments-then-create would). Phone is the primary
    // throttle because it's the billed SMS channel — an attacker rotating a
    // throwaway email while pinning the victim's phone still hits the phone
    // bucket every time and gets capped, same as keying on "phone OR email"
    // did, just race-free.
    const [phoneHourly, emailHourly] = await Promise.all([
      rateLimit(`otp-hr:phone:${phone}`, { limit: MAX_PER_HOUR, windowMs: RATE_WINDOW_MS }),
      rateLimit(`otp-hr:email:${emailLc}`, { limit: MAX_PER_HOUR, windowMs: RATE_WINDOW_MS }),
    ]);
    if (!phoneHourly.allowed || !emailHourly.allowed) {
      return NextResponse.json({ error: "Too many codes requested. Try again later." }, { status: 429 });
    }

    // Per-request cooldown, same atomic mechanism with a short window instead
    // of a separate findOne-based check.
    const [phoneCooldown, emailCooldown] = await Promise.all([
      rateLimit(`otp-cd:phone:${phone}`, { limit: 1, windowMs: COOLDOWN_MS }),
      rateLimit(`otp-cd:email:${emailLc}`, { limit: 1, windowMs: COOLDOWN_MS }),
    ]);
    if (!phoneCooldown.allowed || !emailCooldown.allowed) {
      const wait = Math.max(phoneCooldown.retryAfter, emailCooldown.retryAfter);
      return NextResponse.json({ error: `Please wait ${wait}s before requesting another code.`, retryAfter: wait }, { status: 429 });
    }

    // Deliver to exactly ONE channel, never both — knowing the code only
    // proves whichever channel it was actually sent to, and binding both
    // fields into the checkout token from delivery-to-either would let
    // someone attach a victim's untouched channel to their own order (see
    // lib/checkout-token.ts). Phone is preferred: it's the channel Footer.tsx
    // already calls "preferred" contact, and the billed/primary channel per
    // the rate-limit comments above.
    const channel: "phone" | "email" = smsConfigured() ? "phone" : "email";

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const doc = await Otp.create({
      email: emailLc,
      phone,
      channel,
      codeHash: hashCode(code),
      codeExpiresAt: new Date(now + CODE_TTL_MS),
      expiresAt: new Date(now + RATE_WINDOW_MS),
    });

    const deliveryRes =
      channel === "phone"
        ? await sendSMS({ to: phone, body: otpSmsTemplate(code) })
        : await sendEmail({ to: emailLc, subject: `${code} is your Taste Makerrs code`, html: otpEmailTemplate(code, name) });

    const delivered = "ok" in deliveryRes && deliveryRes.ok === true;
    const emailSent = channel === "email" && delivered;
    const smsSent = channel === "phone" && delivered;

    return NextResponse.json({
      enabled: true,
      otpId: doc._id.toString(),
      emailSent,
      smsSent,
      channels: { email: channel === "email", sms: channel === "phone" },
      // Dev convenience only — never returned in production.
      ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
    });
  } catch (e: unknown) {
    // Client validation failures (bad email/phone) are 400s, not server faults —
    // so callers can distinguish them and real 500s stay meaningful in logs.
    if (e instanceof Error && e.name === "ZodError") {
      return NextResponse.json({ error: "Enter a valid email and 10-digit mobile number." }, { status: 400 });
    }
    logError("otp/send", e);
    return NextResponse.json({ error: "Could not send code" }, { status: 500 });
  }
}
