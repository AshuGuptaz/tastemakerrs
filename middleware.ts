import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdmin, ADMIN_COOKIE } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Maintenance mode — set MAINTENANCE_MODE=true in Vercel env vars to enable.
  // Admin and the maintenance page itself are always reachable.
  if (
    process.env.MAINTENANCE_MODE === "true" &&
    !pathname.startsWith("/maintenance") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/favicon")
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/maintenance";
    return NextResponse.redirect(url);
  }

  // Protect /admin/** routes (except /admin/login).
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
