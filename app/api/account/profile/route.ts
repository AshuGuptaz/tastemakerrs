import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { getCustomerFromCookies } from "@/lib/customer-server";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ name: z.string().trim().min(1).max(80) });

/** PATCH /api/account/profile — update the customer's display name. */
export async function PATCH(req: Request) {
  const claim = await getCustomerFromCookies();
  if (!claim) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  try {
    const { name } = Body.parse(await req.json());
    await connectDB();
    await Customer.updateOne({ _id: claim.cid }, { $set: { name } });
    return NextResponse.json({ ok: true, name });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "ZodError") {
      return NextResponse.json({ error: "Enter a name (1–80 characters)." }, { status: 400 });
    }
    logError("account/profile", e);
    return NextResponse.json({ error: "Could not update your profile." }, { status: 500 });
  }
}
