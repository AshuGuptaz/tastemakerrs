import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { PRODUCTS } from "@/lib/products";
import { getAdminFromCookies } from "@/lib/auth-server";

/**
 * GET  /api/products       — list active products (DB-backed; seed only when no DB configured)
 * POST /api/products       — admin only: create product
 */
export async function GET() {
  // Only fall back to the static seed when no database is configured.
  if (!process.env.MONGODB_URI) {
    return NextResponse.json(PRODUCTS);
  }
  try {
    await connectDB();
    const docs = await Product.find({ active: true }).lean();
    // Return the docs array even when empty — empty is a valid state, not an error.
    return NextResponse.json(docs);
  } catch (e) {
    console.error("GET /api/products failed:", e);
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await connectDB();
    const body = await req.json();
    const created = await Product.create(body);
    return NextResponse.json(created);
  } catch (e) {
    console.error("POST /api/products failed:", e);
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
