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

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const doc = await Otp.create({
      email: emailLc,
      phone,
      codeHash: hashCode(code),
      codeExpiresAt: new Date(now + CODE_TTL_MS),
      expiresAt: new Date(now + RATE_WINDOW_MS),
    });

    // deliver on configured channels (graceful no-op otherwise)
    const [emailRes, smsRes] = await Promise.all([
      emailConfigured()
        ? sendEmail({ to: emailLc, subject: `${code} is your Taste Makerrs code`, html: otpEmailTemplate(code, name) })
        : Promise.resolve({ skipped: true as const }),
      smsConfigured() ? sendSMS({ to: phone, body: otpSmsTemplate(code) }) : Promise.resolve({ skipped: true as const }),
    ]);

    const emailSent = "ok" in emailRes && emailRes.ok;
    const smsSent = "ok" in smsRes && smsRes.ok;

    return NextResponse.json({
      enabled: true,
      otpId: doc._id.toString(),
      emailSent,
      smsSent,
      channels: { email: emailConfigured(), sms: smsConfigured() },
      // Dev convenience only — never returned in production.
      ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
    });
  } catch (e: any) {
    // Client validation failures (bad email/phone) are 400s, not server faults —
    // so callers can distinguish them and real 500s stay meaningful in logs.
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: "Enter a valid email and 10-digit mobile number." }, { status: 400 });
    }
    logError("otp/send", e);
    return NextResponse.json({ error: "Could not send code" }, { status: 500 });
  }
}
