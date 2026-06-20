import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdmin, ADMIN_COOKIE } from "./lib/auth";

/**
 * Protect /admin/** routes (except /admin/login).
 * Unauth users are redirected to /admin/login.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    const admin = await verifyAdmin(token);
    if (!admin) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
