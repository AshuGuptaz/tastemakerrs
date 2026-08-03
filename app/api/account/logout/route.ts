import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE } from "@/lib/customer-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/account/logout — clear the customer session cookie. */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
