import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getAdminFromCookies } from "@/lib/auth-server";

/**
 * PATCH  /api/products/:id — admin only: update (whitelisted mutable fields)
 * DELETE /api/products/:id — admin only: soft-delete (active=false)
 */

// Whitelist ONLY mutable fields. slug/_id/createdAt/updatedAt are intentionally excluded.
const productUpdateSchema = z
  .object({
    name: z.string(),
    category: z.string(),
    price: z.number().min(0),
    unit: z.string(),
    description: z.string(),
    flavors: z.array(z.string()),
    bestseller: z.boolean(),
    eggless: z.boolean(),
    jainFriendly: z.boolean(),
    customizable: z.boolean(),
    image: z.string(),
    bg: z.string(),
    active: z.boolean(),
  })
  .partial()
  .strict();

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid request" }, { status: 400 });
    }
    const updated = await Product.findByIdAndUpdate(params.id, parsed.data, {
      new: true,
      runValidators: true,
    });
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH /api/products/[id] failed:", e);
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  try {
    await connectDB();
    const updated = await Product.findByIdAndUpdate(params.id, { active: false }, { new: true });
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true, updated });
  } catch (e) {
    console.error("DELETE /api/products/[id] failed:", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
