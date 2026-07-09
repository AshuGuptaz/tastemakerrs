import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAdmin, ADMIN_COOKIE } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const maintenanceOn = process.env.MAINTENANCE_MODE === "true";
  const isAdminRoute = pathname.startsWith("/admin");

  // Only pay for JWT verification when it can actually change the outcome:
  // admin routes always need it; other routes only need it to support the
  // maintenance-mode bypass below.
  const admin = isAdminRoute || maintenanceOn
    ? await verifyAdmin(req.cookies.get(ADMIN_COOKIE)?.value)
    : null;

  // Maintenance mode — set MAINTENANCE_MODE=true in Vercel env vars to enable.
  // Logged-in admins bypass it (so the owner can still browse the live site).
  // /api/** is always excluded: it has its own auth, and blocking it breaks
  // payment webhooks (Stripe/Razorpay call these server-to-server regardless
  // of maintenance mode) and the admin dashboard's own data fetches.
  if (
    maintenanceOn &&
    !admin &&
    !pathname.startsWith("/maintenance") &&
    !isAdminRoute &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/favicon") &&
    !/\.[a-zA-Z0-9]+$/.test(pathname) // let static assets (images, fonts, etc.) through
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/maintenance";
    const res = NextResponse.redirect(url);
    res.headers.set("Retry-After", "3600");
    return res;
  }

  // Protect /admin/** routes (except /admin/login).
  if (isAdminRoute && !pathname.startsWith("/admin/login") && !admin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
