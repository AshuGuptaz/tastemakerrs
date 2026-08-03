import { SignJWT, jwtVerify } from "jose";

/**
 * Long-lived customer SESSION token, issued after a successful OTP verification
 * (app/api/otp/verify). Distinct from the 20-minute checkout token in
 * lib/checkout-token: this is the persistent "you are signed in" session that
 * powers /account, order history, saved addresses and occasions.
 *
 * Signed with OTP_JWT_SECRET — the same customer-side secret as the checkout
 * token, deliberately SEPARATE from ADMIN_JWT_SECRET. It carries `role:
 * "customer"`, and lib/auth.verifyAdmin rejects any token whose role isn't
 * "admin", so a customer session can never authenticate as admin even if the
 * two secrets were ever misconfigured to the same value.
 *
 * Because the payload also carries the proven `phone`/`email`, a valid session
 * doubles as checkout proof (contactMatches accepts the same shape) — that's
 * what makes a signed-in customer's checkout one tap, with no re-OTP.
 */

const ENC = new TextEncoder();

export const CUSTOMER_COOKIE = "ttm_customer_token";
export const CUSTOMER_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const getSecret = () => {
  const s = process.env.OTP_JWT_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("OTP_JWT_SECRET must be set in production");
  }
  return s || "dev-only-otp-secret-change-me";
};

export interface CustomerClaim {
  cid: string;
  phone?: string;
  email?: string;
}

export async function signCustomer(claim: CustomerClaim) {
  return new SignJWT({ cid: claim.cid, phone: claim.phone, email: claim.email, role: "customer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(ENC.encode(getSecret()));
}

export async function verifyCustomer(
  token: string | undefined
): Promise<CustomerClaim | null> {
  if (!token) return null;
  const secret = process.env.OTP_JWT_SECRET;
  if (!secret && process.env.NODE_ENV === "production") return null;
  try {
    const { payload } = await jwtVerify(token, ENC.encode(secret || "dev-only-otp-secret-change-me"));
    if (payload.role !== "customer" || typeof payload.cid !== "string") return null;
    return { cid: payload.cid, phone: payload.phone as string | undefined, email: payload.email as string | undefined };
  } catch {
    return null;
  }
}
