import { cookies } from "next/headers";
import { verifyCustomer, CUSTOMER_COOKIE, type CustomerClaim } from "./customer-auth";

/**
 * Reads the customer session JWT from request cookies (App Router server
 * context only). Returns the decoded claim ({ cid, phone?, email? }) or null.
 */
export async function getCustomerFromCookies(): Promise<CustomerClaim | null> {
  const c = cookies().get(CUSTOMER_COOKIE)?.value;
  return verifyCustomer(c);
}
