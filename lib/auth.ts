import { SignJWT, jwtVerify } from "jose";

/**
 * Edge-safe auth helpers (no next/headers imports here so this file
 * can be imported from middleware.ts which runs in the Edge runtime).
 *
 * For server components / API routes that need the cookie automatically,
 * use `getAdminFromCookies` from `lib/auth-server.ts`.
 */

const ENC = new TextEncoder();

const RAW = process.env.ADMIN_JWT_SECRET?.trim();
if (process.env.NODE_ENV === "production") {
  if (!RAW || RAW.length < 32) {
    throw new Error(
      "ADMIN_JWT_SECRET must be set to at least 32 characters in production"
    );
  }
} else if (!RAW || RAW.length < 32) {
  console.warn(
    "[auth] ADMIN_JWT_SECRET not set (or too short); using insecure dev-only secret. DO NOT use in production."
  );
}
const SECRET = RAW && RAW.length >= 32 ? RAW : "dev-only-secret-change-me";

export const ADMIN_COOKIE = "ttm_admin_token";

export async function signAdmin(email: string) {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(ENC.encode(SECRET));
}

export async function verifyAdmin(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, ENC.encode(SECRET));
    return payload as { email: string; role: string };
  } catch {
    return null;
  }
}
