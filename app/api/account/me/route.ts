import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { getCustomerFromCookies } from "@/lib/customer-server";
import { customerEmail, customerPhone } from "@/lib/customer";
import { serializeAddresses, serializeOccasions } from "@/lib/account-serialize";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/account/me — the signed-in customer's profile, or `{ customer: null }` (200) when not signed in.
 *  Signed-out is a normal state, not an error: a 401 here logged a red console
 *  error (and a failed network request) on EVERY anonymous page view. */
export async function GET() {
  const claim = await getCustomerFromCookies();
  if (!claim) return NextResponse.json({ customer: null });
  try {
    await connectDB();
    const c = await Customer.findById(claim.cid).lean();
    if (!c) return NextResponse.json({ customer: null });
    return NextResponse.json({
      customer: {
        id: c._id.toString(),
        name: c.name ?? "",
        email: customerEmail(c) ?? "",
        phone: customerPhone(c) ?? "",
        addresses: serializeAddresses(c.addresses),
        occasions: serializeOccasions(c.occasions),
      },
    });
  } catch (e) {
    logError("account/me", e);
    return NextResponse.json({ error: "Could not load your account." }, { status: 500 });
  }
}
