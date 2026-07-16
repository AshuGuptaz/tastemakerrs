import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";

/**
 * Short-lived "verified contact" token issued after a successful checkout OTP.
 * The order API requires it (when OTP is enabled) and checks email+phone match.
 *
 * Uses OTP_JWT_SECRET — a secret SEPARATE from ADMIN_JWT_SECRET so a checkout
 * token cannot be used to authenticate as admin.
 */

const getSecret = () => {
  const s = process.env.OTP_JWT_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    // Refuse to fall back to the admin secret in production; a shared secret
    // would allow a checkout token to pass admin JWT verification.
    throw new Error("OTP_JWT_SECRET must be set in production (must differ from ADMIN_JWT_SECRET)");
  }
  return s || "dev-only-otp-secret-change-me";
};

const getHashSecret = () => process.env.OTP_HASH_SECRET || getSecret();

const ENC = new TextEncoder();

export const CHECKOUT_COOKIE = "ttm_checkout_token";

const norm = (s: string) => s.trim().toLowerCase();
// Digits-only so a +91 / spaces / dashes variant on one side can't fail an
// otherwise-valid match (both endpoints validate ^[6-9]\d{9}$ today, so this is
// defensive — it keeps the comparison correct if that ever loosens).
const normPhone = (s: string) => s.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");

/** HMAC-hash an OTP code so plaintext codes are never stored. */
export function hashCode(code: string) {
  return crypto.createHmac("sha256", getHashSecret()).update(code).digest("hex");
}

/**
 * Binds exactly ONE verified channel — whichever one the code was actually
 * delivered to and read from. The OTP is sent to a single channel per
 * request (see app/api/otp/send/route.ts), so proving knowledge of the code
 * only ever proves that one channel, never both at once.
 */
export async function signCheckout(verified: { email: string } | { phone: string }) {
  const claim =
    "phone" in verified ? { phone: normPhone(verified.phone) } : { email: norm(verified.email) };
  return new SignJWT(claim)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("20m")
    .sign(ENC.encode(getSecret()));
}

export async function verifyCheckout(token: string | undefined) {
  if (!token) return null;
  const secret = process.env.OTP_JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") return null;
  try {
    const { payload } = await jwtVerify(token, ENC.encode(secret || "dev-only-otp-secret-change-me"));
    return payload as { email?: string; phone?: string };
  } catch {
    return null;
  }
}

/**
 * True when the verified channel in the token matches the order's address.
 * The token only ever contains ONE proven channel — the other field on the
 * order address is accepted as contact info but isn't independently proven.
 */
export function contactMatches(
  token: { email?: string; phone?: string } | null,
  address: { email: string; phone: string }
) {
  if (!token) return false;
  if (token.phone) return normPhone(token.phone) === normPhone(address.phone);
  if (token.email) return token.email === norm(address.email);
  return false;
}
