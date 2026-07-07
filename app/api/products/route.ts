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
    // Bounded + projected: the catalog is public and uncached, so cap the result
    // and drop internal fields (__v, timestamps) rather than returning the whole
    // collection with everything on every menu load.
    const docs = await Product.find({ active: true }, { __v: 0, createdAt: 0, updatedAt: 0 })
      .limit(500)
      .lean();
    if (docs.length > 0) return NextResponse.json(docs);
  } catch (e: any) {
    // Fall back to the static seed so the menu still renders, but log it —
    // otherwise a real DB outage looks identical to an empty catalog and admin
    // writes silently target a DB that's actually down.
    console.error("[products/GET] DB read failed, serving seed:", e?.message);
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
    if (e?.code === 11000) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }
    console.error("[products/POST]", e?.message);
    return NextResponse.json({ error: "Could not create product" }, { status: 400 });
  }
}
