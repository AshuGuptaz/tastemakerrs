import { cookies } from "next/headers";
import { verifyAdmin, ADMIN_COOKIE } from "./auth";

/**
 * Reads the admin JWT from the request cookies (App Router server context only).
 * Returns the decoded payload or null.
 */
export async function getAdminFromCookies() {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  return verifyAdmin(c);
}
