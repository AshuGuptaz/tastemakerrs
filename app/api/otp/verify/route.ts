import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Otp } from "@/models/Otp";
import { hashCode, signCheckout, CHECKOUT_COOKIE } from "@/lib/checkout-token";
import { logError } from "@/lib/logger";

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
    // Guard the ObjectId shape so a malformed id is a clean 400, not a CastError 500.
    if (!mongoose.isValidObjectId(otpId)) {
      return NextResponse.json({ ok: false, error: "This code is no longer valid. Request a new one." }, { status: 400 });
    }
    await connectDB();

    // Atomically consume one attempt. The conditional filter + $inc is a single
    // document operation, so concurrent guesses can't each read a stale low
    // `attempts` and blow past MAX_ATTEMPTS — the brute-force window a
    // load-mutate-save pattern would leave open. A null result means the code is
    // consumed, expired, missing, or out of attempts.
    const doc = await Otp.findOneAndUpdate(
      { _id: otpId, consumed: false, codeExpiresAt: { $gt: new Date() }, attempts: { $lt: MAX_ATTEMPTS } },
      { $inc: { attempts: 1 } },
      { new: true }
    );
    if (!doc) {
      return NextResponse.json({ ok: false, error: "This code is no longer valid or has too many attempts. Request a new one." }, { status: 400 });
    }

    const expected = doc.codeHash;
    const actual = hashCode(code);
    const match =
      expected.length === actual.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(actual));

    if (!match) {
      const left = MAX_ATTEMPTS - doc.attempts;
      return NextResponse.json({ ok: false, error: `Incorrect code.${left > 0 ? ` ${left} attempt${left === 1 ? "" : "s"} left.` : ""}` }, { status: 400 });
    }

    // Consume atomically so a correct code can be redeemed exactly once even if
    // two requests race in with it.
    const consumed = await Otp.findOneAndUpdate(
      { _id: otpId, consumed: false },
      { consumed: true }
    );
    if (!consumed) {
      return NextResponse.json({ ok: false, error: "This code is no longer valid. Request a new one." }, { status: 400 });
    }

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
    // Malformed payload (missing otpId / non-6-digit code) is a 400, not a
    // server fault — mirrors the other API routes and keeps real 500s meaningful.
    if (e?.name === "ZodError") {
      return NextResponse.json({ ok: false, error: "Enter the 6-digit code." }, { status: 400 });
    }
    logError("otp/verify", e);
    return NextResponse.json({ ok: false, error: "Verification failed" }, { status: 500 });
  }
}
