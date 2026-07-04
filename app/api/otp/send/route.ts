import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Otp } from "@/models/Otp";
import { hashCode } from "@/lib/checkout-token";
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

export async function POST(req: Request) {
  try {
    const { email, phone, name } = Body.parse(await req.json());

    // If no delivery channel is configured in production, OTP is off — tell the
    // client to proceed without it so checkout never breaks before keys are set.
    if (!otpEnabled()) {
      return NextResponse.json({ enabled: false });
    }

    await connectDB();
    const emailLc = email.trim().toLowerCase();
    const now = Date.now();

    // Hourly cap first (count is idempotent; even a race between two concurrent
    // requests is harmless because both will see the real count).
    const recent = await Otp.countDocuments({ email: emailLc, createdAt: { $gte: new Date(now - 3600_000) } });
    if (recent >= MAX_PER_HOUR) {
      return NextResponse.json({ error: "Too many codes requested. Try again later." }, { status: 429 });
    }

    // Per-request cooldown (narrow TOCTOU window — acceptable for OTP use-case).
    const last = await Otp.findOne({ email: emailLc, phone }).sort({ createdAt: -1 }).lean();
    if (last && now - new Date(last.createdAt).getTime() < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (now - new Date(last.createdAt).getTime())) / 1000);
      return NextResponse.json({ error: `Please wait ${wait}s before requesting another code.`, retryAfter: wait }, { status: 429 });
    }

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const doc = await Otp.create({
      email: emailLc,
      phone,
      codeHash: hashCode(code),
      expiresAt: new Date(now + 10 * 60_000),
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
    console.error("[otp/send] error:", e?.message);
    return NextResponse.json({ error: "Could not send code" }, { status: 500 });
  }
}
