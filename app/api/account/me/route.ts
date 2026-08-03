import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { getCustomerFromCookies } from "@/lib/customer-server";
import { customerEmail, customerPhone } from "@/lib/customer";
import { serializeAddresses, serializeOccasions } from "@/lib/account-serialize";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/account/me — the signed-in customer's profile, or 401 if not signed in. */
export async function GET() {
  const claim = await getCustomerFromCookies();
  if (!claim) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  try {
    await connectDB();
    const c = await Customer.findById(claim.cid).lean();
    if (!c) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
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
