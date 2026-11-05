import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { getAdminFromCookies } from "@/lib/auth-server";
import { getBySlug, PRODUCTS } from "@/lib/products";
import { logError } from "@/lib/logger";
import { reviewPhotoUrls } from "@/lib/review-photos";

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
    // Exclude the photo bytes; the moderation page loads each image from /api/reviews/photo (admin may view any status).
    const reviews = await Review.aggregate<{
      _id: { toString(): string }; productId: string; rating: number; title?: string; body: string; authorName: string; status: string; createdAt: Date; updatedAt: Date; photoCount: number;
    }>([
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $limit: 200 },
      { $project: { productId: 1, rating: 1, title: 1, body: 1, authorName: 1, status: 1, createdAt: 1, updatedAt: 1, photoCount: { $size: { $ifNull: ["$photos", []] } } } },
    ]);
    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r._id.toString(),
        productId: r.productId,
        productName: productName(r.productId),
        rating: r.rating,
        title: r.title ?? "",
        body: r.body,
        photos: reviewPhotoUrls(r._id.toString(), r.photoCount, r.updatedAt),
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
