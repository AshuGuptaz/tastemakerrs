import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";

/**
 * Short-lived "verified contact" token issued after a successful checkout OTP.
 * The order API requires it (when OTP is enabled) and checks email+phone match.
 */

const SECRET = process.env.OTP_JWT_SECRET || process.env.ADMIN_JWT_SECRET || "dev-only-secret-change-me";
const HASH_SECRET = process.env.OTP_HASH_SECRET || SECRET;
const ENC = new TextEncoder();

export const CHECKOUT_COOKIE = "ttm_checkout_token";

const norm = (s: string) => s.trim().toLowerCase();

/** HMAC-hash an OTP code so plaintext codes are never stored. */
export function hashCode(code: string) {
  return crypto.createHmac("sha256", HASH_SECRET).update(code).digest("hex");
}

export async function signCheckout(email: string, phone: string) {
  return new SignJWT({ email: norm(email), phone: phone.trim() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("20m")
    .sign(ENC.encode(SECRET));
}

export async function verifyCheckout(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, ENC.encode(SECRET));
    return payload as { email: string; phone: string };
  } catch {
    return null;
  }
}

/** True when the verified token's contact matches the order's address. */
export function contactMatches(
  token: { email: string; phone: string } | null,
  address: { email: string; phone: string }
) {
  if (!token) return false;
  return token.email === norm(address.email) && token.phone === address.phone.trim();
}
