import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { getCustomerFromCookies } from "@/lib/customer-server";
import { serializeOccasions } from "@/lib/account-serialize";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_OCCASIONS = 25;

const OccasionBody = z.object({
  label: z.string().trim().min(1).max(60),
  type: z.enum(["birthday", "anniversary", "other"]).optional().default("birthday"),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  recipientName: z.string().trim().max(80).optional().default(""),
  remind: z.boolean().optional().default(true),
});

/** POST /api/account/occasions — save a birthday/anniversary to be reminded about. */
export async function POST(req: Request) {
  const claim = await getCustomerFromCookies();
  if (!claim) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  try {
    const occ = OccasionBody.parse(await req.json());
    // Reject impossible calendar dates (e.g. 31 Feb) up front.
    if (occ.day > new Date(2024, occ.month, 0).getDate()) {
      return NextResponse.json({ error: "That date doesn't exist for the chosen month." }, { status: 400 });
    }
    await connectDB();
    const c = await Customer.findById(claim.cid);
    if (!c) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if ((c.occasions?.length ?? 0) >= MAX_OCCASIONS) {
      return NextResponse.json({ error: `You can save up to ${MAX_OCCASIONS} occasions.` }, { status: 400 });
    }
    c.occasions.push({ ...occ, lastRemindedYear: null });
    await c.save();
    return NextResponse.json({ ok: true, occasions: serializeOccasions(c.occasions) });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "ZodError") {
      return NextResponse.json({ error: "Please fill in the occasion name and date." }, { status: 400 });
    }
    logError("account/occasions:POST", e);
    return NextResponse.json({ error: "Could not save the occasion." }, { status: 500 });
  }
}

/** DELETE /api/account/occasions?id=… — remove a saved occasion. */
export async function DELETE(req: Request) {
  const claim = await getCustomerFromCookies();
  if (!claim) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid occasion." }, { status: 400 });
    }
    await connectDB();
    const c = await Customer.findById(claim.cid);
    if (!c) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    c.occasions = c.occasions.filter((o) => o._id?.toString() !== id) as typeof c.occasions;
    await c.save();
    return NextResponse.json({ ok: true, occasions: serializeOccasions(c.occasions) });
  } catch (e) {
    logError("account/occasions:DELETE", e);
    return NextResponse.json({ error: "Could not remove the occasion." }, { status: 500 });
  }
}
