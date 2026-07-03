import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { PRODUCTS } from "@/lib/products";
import { getAdminFromCookies } from "@/lib/auth-server";
import { ProductInput } from "@/lib/product-schema";

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
    const data = ProductInput.parse(await req.json());
    await connectDB();
    const created = await Product.create(data);
    return NextResponse.json(created);
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }
    console.error("[products/POST]", e?.message);
    return NextResponse.json({ error: "Could not create product" }, { status: 400 });
  }
}
