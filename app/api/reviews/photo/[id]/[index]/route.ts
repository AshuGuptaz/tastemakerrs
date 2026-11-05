import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { getAdminFromCookies } from "@/lib/auth-server";
import { parsePhotoDataUrl } from "@/lib/review-photos";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

/**
 * GET /api/reviews/photo/:id/:index — one review photo as a real image.
 *  - public: only photos of APPROVED reviews (pending/rejected are 404);
 *  - admin session: any status, so moderators can see what they're approving.
 * Raster formats only, served with a locked-down CSP + nosniff so an uploaded
 * file can never execute as a page.
 */
export async function GET(_req: Request, { params }: { params: { id: string; index: string } }) {
  try {
    const idx = Number(params.index);
    if (!mongoose.isValidObjectId(params.id) || !Number.isInteger(idx) || idx < 0 || idx > 10) return notFound();

    await connectDB();
    const r = await Review.findById(params.id).select("photos status").lean();
    if (!r) return notFound();

    const admin = r.status === "approved" ? null : await getAdminFromCookies();
    if (r.status !== "approved" && !admin) return notFound();

    const parsed = r.photos?.[idx] ? parsePhotoDataUrl(r.photos[idx]) : null;
    if (!parsed) return notFound();

    return new Response(new Uint8Array(parsed.bytes), {
      headers: {
        "Content-Type": parsed.mime,
        "Content-Length": String(parsed.bytes.length),
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        // Approved photos are public + cacheable (URL carries ?v=updatedAt so edits bust it);
        // anything an admin is moderating must not be cached.
        "Cache-Control": r.status === "approved" ? "public, max-age=86400" : "private, no-store",
      },
    });
  } catch (e) {
    logError("reviews/photo", e);
    return notFound();
  }
}
