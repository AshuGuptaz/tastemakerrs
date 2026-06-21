import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAdmin, ADMIN_COOKIE } from "@/lib/auth";

// A real, valid bcrypt hash (cost 10) used to equalize timing when the
// submitted email does not match the admin email, preventing user enumeration.
const DUMMY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@thetastemakerrs.com";
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

  if (!ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }

  // Always run a bcrypt comparison to keep response timing constant
  // regardless of whether the email matches the admin email.
  const isAdminEmail = email === ADMIN_EMAIL;
  const ok = await bcrypt.compare(
    password,
    isAdminEmail ? ADMIN_PASSWORD_HASH : DUMMY_HASH
  );
  const valid = ok && isAdminEmail;

  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

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
