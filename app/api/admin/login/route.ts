import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAdmin, ADMIN_COOKIE } from "@/lib/auth";

// Simple in-memory rate limiter — good for single-instance deployments.
// For multi-instance (Vercel concurrent lambdas) replace with Redis/Upstash.
const _attempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 10;
const LOCK_MS = 15 * 60_000;

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
function checkRateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = _attempts.get(ip);
  if (!entry) { _attempts.set(ip, { count: 1, lockedUntil: 0 }); return { ok: true }; }
  if (entry.lockedUntil > now) return { ok: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  entry.count++;
  if (entry.count >= MAX_ATTEMPTS) entry.lockedUntil = now + LOCK_MS;
  return { ok: true };
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const limit = checkRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${limit.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const { email, password } = await req.json();
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@thetastemakerrs.com";
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

  if (!ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }

  // Always run bcrypt to avoid timing differences between wrong-email and wrong-password.
  const emailOk = email === ADMIN_EMAIL;
  const passwordOk = await bcrypt.compare(password || "", ADMIN_PASSWORD_HASH);
  if (!emailOk || !passwordOk) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  _attempts.delete(ip);
  const token = await signAdmin(email);
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
