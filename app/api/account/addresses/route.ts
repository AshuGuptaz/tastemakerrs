import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { getCustomerFromCookies } from "@/lib/customer-server";
import { serializeAddresses } from "@/lib/account-serialize";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ADDRESSES = 10;

const AddressBody = z.object({
  label: z.string().trim().max(40).optional().default("Home"),
  name: z.string().trim().min(1).max(80),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  street: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().min(1).max(80),
  pincode: z.string().trim().min(4).max(10),
  notes: z.string().trim().max(300).optional().default(""),
  isDefault: z.boolean().optional().default(false),
});

/** POST /api/account/addresses — add a saved address to the book. */
export async function POST(req: Request) {
  const claim = await getCustomerFromCookies();
  if (!claim) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  try {
    const addr = AddressBody.parse(await req.json());
    await connectDB();
    const c = await Customer.findById(claim.cid);
    if (!c) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    if ((c.addresses?.length ?? 0) >= MAX_ADDRESSES) {
      return NextResponse.json({ error: `You can save up to ${MAX_ADDRESSES} addresses.` }, { status: 400 });
    }
    // A new default demotes the others so exactly one stays default.
    if (addr.isDefault) c.addresses.forEach((a) => (a.isDefault = false));
    // First address is default by definition.
    if (!c.addresses.length) addr.isDefault = true;
    c.addresses.push(addr);
    await c.save();
    return NextResponse.json({ ok: true, addresses: serializeAddresses(c.addresses) });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "ZodError") {
      return NextResponse.json({ error: "Please fill in every address field." }, { status: 400 });
    }
    logError("account/addresses:POST", e);
    return NextResponse.json({ error: "Could not save the address." }, { status: 500 });
  }
}

/** DELETE /api/account/addresses?id=… — remove a saved address. */
export async function DELETE(req: Request) {
  const claim = await getCustomerFromCookies();
  if (!claim) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id || !mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid address." }, { status: 400 });
    }
    await connectDB();
    const c = await Customer.findById(claim.cid);
    if (!c) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    const wasDefault = c.addresses.find((a) => a._id?.toString() === id)?.isDefault;
    c.addresses = c.addresses.filter((a) => a._id?.toString() !== id) as typeof c.addresses;
    // If we removed the default, promote the first remaining one.
    if (wasDefault && c.addresses.length && !c.addresses.some((a) => a.isDefault)) {
      c.addresses[0].isDefault = true;
    }
    await c.save();
    return NextResponse.json({ ok: true, addresses: serializeAddresses(c.addresses) });
  } catch (e) {
    logError("account/addresses:DELETE", e);
    return NextResponse.json({ error: "Could not remove the address." }, { status: 500 });
  }
}
