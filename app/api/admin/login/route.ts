import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAdmin, ADMIN_COOKIE } from "@/lib/auth";
import { rateLimit, resetRateLimit, clientIp } from "@/lib/rate-limit";

const MAX_ATTEMPTS = 10;
const LOCK_MS = 15 * 60_000;

export async function POST(req: Request) {
  const ip = clientIp(req);
  // Cross-instance brute-force limit (shared MongoDB store). Still keyed on the
  // proxy-provided IP — a determined attacker can rotate it, so this is one
  // layer, not the whole defense (bcrypt cost + a strong password are the rest).
  const rlKey = `login:${ip}`;
  const limit = await rateLimit(rlKey, { limit: MAX_ATTEMPTS, windowMs: LOCK_MS });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${limit.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let email: unknown, password: unknown;
  try {
    ({ email, password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@thetastemakerrs.com";
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

  if (!ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }

  // Always run bcrypt to avoid timing differences between wrong-email and wrong-password.
  const emailOk = typeof email === "string" && email === ADMIN_EMAIL;
  const passwordOk = await bcrypt.compare(typeof password === "string" ? password : "", ADMIN_PASSWORD_HASH);
  if (!emailOk || !passwordOk) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  await resetRateLimit(rlKey);
  const token = await signAdmin(email as string);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res;
}
