import { SignJWT, jwtVerify } from "jose";

/**
 * Edge-safe auth helpers (no next/headers imports here so this file
 * can be imported from middleware.ts which runs in the Edge runtime).
 *
 * For server components / API routes that need the cookie automatically,
 * use `getAdminFromCookies` from `lib/auth-server.ts`.
 */

const ENC = new TextEncoder();

const getSecret = () => {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_JWT_SECRET must be set in production");
  }
  return s || "dev-only-secret-change-me";
};

export const ADMIN_COOKIE = "ttm_admin_token";

export async function signAdmin(email: string) {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(ENC.encode(getSecret()));
}

export async function verifyAdmin(token: string | undefined) {
  if (!token) return null;
  const secret = process.env.ADMIN_JWT_SECRET;
  // Fail-closed in production: if no secret is configured, reject all tokens
  // rather than accept them against the known dev fallback.
  if (!secret && process.env.NODE_ENV === "production") return null;
  try {
    const { payload } = await jwtVerify(token, ENC.encode(secret || "dev-only-secret-change-me"));
    // Belt-and-suspenders: a checkout token ({email, phone}, no role) must
    // never verify as admin even if ADMIN_JWT_SECRET and OTP_JWT_SECRET were
    // ever misconfigured to the same value — check the claim, not just the
    // signature.
    if (payload.role !== "admin") return null;
    return payload as { email: string; role: string };
  } catch {
    return null;
  }
}
