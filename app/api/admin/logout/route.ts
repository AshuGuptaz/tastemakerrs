import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  // Derive the redirect URL from the incoming request rather than NEXT_PUBLIC_SITE_URL
  // (which is a client-side env var and may be wrong behind a proxy/CDN).
  const loginUrl = new URL("/admin/login", req.url);
  const res = NextResponse.redirect(loginUrl);
  res.cookies.set(ADMIN_COOKIE, "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  return res;
}
