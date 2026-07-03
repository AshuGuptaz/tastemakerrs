import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getAdminFromCookies } from "@/lib/auth-server";

/**
 * PATCH  /api/products/:id — admin only: update
 * DELETE /api/products/:id — admin only: soft-delete (active=false)
 */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  // Wrap in $set to prevent operator injection (e.g. { "$where": "..." } in body).
  const updated = await Product.findByIdAndUpdate(params.id, { $set: body }, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const updated = await Product.findByIdAndUpdate(params.id, { active: false }, { new: true });
  return NextResponse.json({ ok: true, updated });
}
