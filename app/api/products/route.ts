import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { PRODUCTS } from "@/lib/products";
import { getAdminFromCookies } from "@/lib/auth-server";

/**
 * GET  /api/products       — list active products (DB-backed; falls back to seed)
 * POST /api/products       — admin only: create product
 */
export async function GET() {
  try {
    await connectDB();
    const docs = await Product.find({ active: true }).lean();
    if (docs.length > 0) return NextResponse.json(docs);
  } catch {
    // fallthrough to seed
  }
  return NextResponse.json(PRODUCTS);
}

export async function POST(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const body = await req.json();
    const created = await Product.create(body);
    return NextResponse.json(created);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
