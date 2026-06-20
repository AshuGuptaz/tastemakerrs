import { SignJWT, jwtVerify } from "jose";

/**
 * Edge-safe auth helpers (no next/headers imports here so this file
 * can be imported from middleware.ts which runs in the Edge runtime).
 *
 * For server components / API routes that need the cookie automatically,
 * use `getAdminFromCookies` from `lib/auth-server.ts`.
 */

const ENC = new TextEncoder();
const SECRET = process.env.ADMIN_JWT_SECRET || "dev-only-secret-change-me";

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
