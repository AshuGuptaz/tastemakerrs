import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signAdmin, ADMIN_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@thetastemakerrs.com";
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";

  if (!ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 });
  }
  if (email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = await signAdmin(email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
