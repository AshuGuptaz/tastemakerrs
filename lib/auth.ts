import { SignJWT, jwtVerify } from "jose";

/**
 * Edge-safe auth helpers (no next/headers imports here so this file
 * can be imported from middleware.ts which runs in the Edge runtime).
 *
 * For server components / API routes that need the cookie automatically,
 * use `getAdminFromCookies` from `lib/auth-server.ts`.
 */

const ENC = new TextEncoder();

export const ADMIN_COOKIE = "ttm_admin_token";

/**
 * Resolve the signing/verification secret LAZILY (per call), not at module load.
 * Resolving at import time would throw during `next build` whenever the env var
 * isn't present at build (it is bundled into Edge middleware), failing the build.
 *
 * Fail-closed semantics are preserved at runtime: in production a missing/short
 * secret throws, so signAdmin() refuses to issue tokens and verifyAdmin() denies
 * (it catches the throw and returns null). In development we fall back to a clearly
 * insecure dev secret so local work isn't blocked.
 */
function getSecret(): string {
  const RAW = process.env.ADMIN_JWT_SECRET?.trim();
  if (RAW && RAW.length >= 32) return RAW;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_JWT_SECRET must be set to at least 32 characters in production");
  }
  console.warn(
    "[auth] ADMIN_JWT_SECRET not set (or too short); using insecure dev-only secret. DO NOT use in production."
  );
  return "dev-only-insecure-secret-change-me-please";
}

export async function signAdmin(email: string) {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(ENC.encode(getSecret()));
}

export async function verifyAdmin(token: string | undefined) {
  if (!token) return null;
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return null; // fail closed: no usable secret → deny access
  }
  try {
    const { payload } = await jwtVerify(token, ENC.encode(secret));
    return payload as { email: string; role: string };
  } catch {
    return null;
  }
}
