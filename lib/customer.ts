import { connectDB } from "@/lib/mongodb";
import { Customer, type ICustomer } from "@/models/Customer";

const norm = (s: string) => s.trim().toLowerCase();
const normPhone = (s: string) => s.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");

/**
 * Upsert the passwordless customer keyed on the channel that was just PROVEN
 * via OTP. Both contact fields are entered at OTP time (checkout collects
 * both), but only the delivered channel is proven — so identity is keyed
 * strictly on the proven one; the other channel is stored as un-indexed
 * `contactEmail`/`contactPhone` (display/notification only, never used for
 * lookup). This prevents an attacker who proves only their own email from
 * matching a row identified by someone else's phone. Idempotent; runs on every
 * successful verify.
 */
export async function upsertVerifiedCustomer(input: {
  channel: "phone" | "email";
  phone?: string;
  email?: string;
  name?: string;
}): Promise<ICustomer> {
  await connectDB();
  const phone = input.phone ? normPhone(input.phone) : undefined;
  const email = input.email ? norm(input.email) : undefined;

  const query = input.channel === "phone" ? { phone } : { email };

  // Only ever fill convenience/profile fields — never the OTHER proven channel.
  const set: Record<string, unknown> = {};
  if (input.channel === "phone" && email) set.contactEmail = email;
  if (input.channel === "email" && phone) set.contactPhone = phone;
  if (input.name) set.name = input.name;

  const doc = await Customer.findOneAndUpdate(
    query,
    {
      $setOnInsert: input.channel === "phone" ? { phone } : { email },
      ...(Object.keys(set).length ? { $set: set } : {}),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return doc as ICustomer;
}

/** The best email we have for a customer (proven first, then convenience). */
export function customerEmail(c: Pick<ICustomer, "email" | "contactEmail">): string | undefined {
  return c.email || c.contactEmail || undefined;
}
/** The best phone we have for a customer (proven first, then convenience). */
export function customerPhone(c: Pick<ICustomer, "phone" | "contactPhone">): string | undefined {
  return c.phone || c.contactPhone || undefined;
}
