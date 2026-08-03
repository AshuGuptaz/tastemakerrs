import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { getAdminFromCookies } from "@/lib/auth-server";
import { getBySlug, PRODUCTS } from "@/lib/products";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function productName(id: string) {
  return PRODUCTS.find((p) => p.id === id)?.name || getBySlug(id)?.name || id;
}

/** GET /api/admin/reviews?status=pending — admin: list reviews for moderation. */
export async function GET(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const status = new URL(req.url).searchParams.get("status") || "pending";
    const filter = ["pending", "approved", "rejected"].includes(status) ? { status } : {};
    await connectDB();
    const reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r._id.toString(),
        productId: r.productId,
        productName: productName(r.productId),
        rating: r.rating,
        title: r.title ?? "",
        body: r.body,
        photos: r.photos ?? [],
        authorName: r.authorName,
        status: r.status,
        createdAt: r.createdAt,
      })),
    });
  } catch (e) {
    logError("admin/reviews/GET", e);
    return NextResponse.json({ error: "Could not load reviews." }, { status: 500 });
  }
}

const PatchBody = z.object({
  id: z.string().min(1),
  status: z.enum(["approved", "rejected", "pending"]),
});

/** PATCH /api/admin/reviews — admin: approve/reject a review. */
export async function PATCH(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id, status } = PatchBody.parse(await req.json());
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid review." }, { status: 400 });
    await connectDB();
    const r = await Review.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!r) return NextResponse.json({ error: "Review not found." }, { status: 404 });
    return NextResponse.json({ ok: true, status });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
    logError("admin/reviews/PATCH", e);
    return NextResponse.json({ error: "Could not update the review." }, { status: 500 });
  }
}
