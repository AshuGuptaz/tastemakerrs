import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { Order } from "@/models/Order";
import { Customer } from "@/models/Customer";
import { getCustomerFromCookies } from "@/lib/customer-server";
import { PRODUCTS } from "@/lib/products";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_PHOTOS = 4;
const MAX_PHOTO_CHARS = 900_000; // ~650KB raw per image, inline data URL

const Body = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional().default(""),
  body: z.string().trim().min(3).max(2000),
  authorName: z.string().trim().max(80).optional().default(""),
  photos: z.array(z.string()).max(MAX_PHOTOS).optional().default([]),
});

/**
 * GET /api/reviews?productId=… — approved reviews + rating summary for a
 * product. Public. Also returns `canReview`/`hasReviewed` for the current
 * signed-in customer so the UI can show the write-a-review affordance.
 */
export async function GET(req: Request) {
  try {
    const productId = new URL(req.url).searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    await connectDB();

    const reviews = await Review.find({ productId, status: "approved" }).sort({ createdAt: -1 }).limit(100).lean();

    const count = reviews.length;
    const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
    const distribution = [1, 2, 3, 4, 5].reduce<Record<number, number>>((acc, star) => {
      acc[star] = reviews.filter((r) => r.rating === star).length;
      return acc;
    }, {});

    // Purchase / already-reviewed state for the signed-in customer (best-effort).
    let canReview = false;
    let hasReviewed = false;
    const claim = await getCustomerFromCookies();
    if (claim) {
      const [purchased, mine] = await Promise.all([
        Order.exists({ customerId: claim.cid, paymentStatus: "paid", "items.productId": productId }),
        Review.exists({ productId, customerId: claim.cid }),
      ]);
      canReview = !!purchased;
      hasReviewed = !!mine;
    }

    return NextResponse.json({
      summary: { count, average: Math.round(average * 10) / 10, distribution },
      reviews: reviews.map((r) => ({
        id: r._id.toString(),
        rating: r.rating,
        title: r.title ?? "",
        body: r.body,
        photos: r.photos ?? [],
        authorName: r.authorName,
        createdAt: r.createdAt,
      })),
      canReview,
      hasReviewed,
    });
  } catch (e) {
    logError("reviews/GET", e);
    return NextResponse.json({ error: "Could not load reviews." }, { status: 500 });
  }
}

/**
 * POST /api/reviews — submit (or update) a review. Requires a signed-in
 * customer who has a PAID order containing the product. New/edited reviews go
 * back to "pending" for moderation.
 */
export async function POST(req: Request) {
  const claim = await getCustomerFromCookies();
  if (!claim) return NextResponse.json({ error: "Please sign in to leave a review." }, { status: 401 });
  try {
    const rl = await rateLimit(`review:${clientIp(req)}`, { limit: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429, headers: { "Retry-After": String(rl.retryAfter) } });
    }

    const input = Body.parse(await req.json());

    const product = PRODUCTS.find((p) => p.id === input.productId || p.slug === input.productId);
    if (!product) return NextResponse.json({ error: "Unknown product." }, { status: 400 });

    // Validate photos: image data URLs only, each under the size cap.
    for (const photo of input.photos) {
      if (!photo.startsWith("data:image/") || photo.length > MAX_PHOTO_CHARS) {
        return NextResponse.json({ error: "Each photo must be an image under ~650KB." }, { status: 400 });
      }
    }

    await connectDB();

    // Verified-purchase gate.
    const order = await Order.findOne({ customerId: claim.cid, paymentStatus: "paid", "items.productId": product.id }).select("_id").lean();
    if (!order) {
      return NextResponse.json({ error: "Only verified buyers can review this product." }, { status: 403 });
    }

    const customer = await Customer.findById(claim.cid).select("name").lean();
    const authorName = input.authorName || customer?.name || "A customer";

    // Upsert: a customer editing their review resets it to pending for re-moderation.
    await Review.findOneAndUpdate(
      { productId: product.id, customerId: claim.cid },
      {
        $set: {
          rating: input.rating,
          title: input.title,
          body: input.body,
          photos: input.photos,
          authorName,
          orderId: order._id.toString(),
          status: "pending",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ ok: true, message: "Thanks! Your review will appear once it's approved." });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "ZodError") {
      return NextResponse.json({ error: "Please add a rating and a short review." }, { status: 400 });
    }
    logError("reviews/POST", e);
    return NextResponse.json({ error: "Could not submit your review." }, { status: 500 });
  }
}
