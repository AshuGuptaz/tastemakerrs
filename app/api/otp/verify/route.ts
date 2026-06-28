import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { Otp } from "@/models/Otp";
import { hashCode, signCheckout, CHECKOUT_COOKIE } from "@/lib/checkout-token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  otpId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  try {
    const { otpId, code } = Body.parse(await req.json());
    await connectDB();

    const doc = await Otp.findById(otpId);
    if (!doc || doc.consumed) {
      return NextResponse.json({ ok: false, error: "This code is no longer valid. Request a new one." }, { status: 400 });
    }
    if (doc.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ ok: false, error: "Code expired. Request a new one." }, { status: 400 });
    }
    if (doc.attempts >= MAX_ATTEMPTS) {
      doc.consumed = true;
      await doc.save();
      return NextResponse.json({ ok: false, error: "Too many attempts. Request a new code." }, { status: 429 });
    }

    doc.attempts += 1;
    const expected = doc.codeHash;
    const actual = hashCode(code);
    const match =
      expected.length === actual.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));

    if (!match) {
      await doc.save();
      const left = MAX_ATTEMPTS - doc.attempts;
      return NextResponse.json({ ok: false, error: `Incorrect code.${left > 0 ? ` ${left} attempt${left === 1 ? "" : "s"} left.` : ""}` }, { status: 400 });
    }

    doc.consumed = true;
    await doc.save();

    const token = await signCheckout(doc.email, doc.phone);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(CHECKOUT_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 20 * 60,
    });
    return res;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Verification failed" }, { status: 400 });
  }
}
