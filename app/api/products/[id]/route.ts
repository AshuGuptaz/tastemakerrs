import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getAdminFromCookies } from "@/lib/auth-server";
import { ProductInput } from "@/lib/product-schema";
import { logError } from "@/lib/logger";

/**
 * PATCH  /api/products/:id — admin only: update
 * DELETE /api/products/:id — admin only: soft-delete (active=false)
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }
  try {
    // Validate + whitelist fields (partial). $set on a plain object also blocks
    // operator injection like { "$where": "..." } in the body.
    const data = ProductInput.partial().parse(await req.json());
    await connectDB();
    const updated = await Product.findByIdAndUpdate(params.id, { $set: data }, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "ZodError") {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }
    if ((e as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }
    logError("products/PATCH", e);
    return NextResponse.json({ error: "Could not update product" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }
  try {
    await connectDB();
    const updated = await Product.findByIdAndUpdate(params.id, { active: false }, { new: true });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, updated });
  } catch (e: unknown) {
    logError("products/DELETE", e);
    return NextResponse.json({ error: "Could not remove product" }, { status: 400 });
  }
}
