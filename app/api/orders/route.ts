import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { z } from "zod";
import { getAdminFromCookies } from "@/lib/auth-server";
import { otpEnabled } from "@/lib/notify";
import { verifyCheckout, contactMatches, CHECKOUT_COOKIE } from "@/lib/checkout-token";
import { PRODUCTS } from "@/lib/products";
import { priceCustomCake, customCakeName } from "@/lib/custom-cake";
import { computeTotals } from "@/lib/pricing";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

const ItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string().max(200),
  price: z.number().positive(),
  qty: z.number().int().min(1).max(50),
  variant: z.string().max(100).optional(),
  custom: z.any().optional(),
});

const AddressSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(4),
  notes: z.string().optional().default(""),
});

// Client no longer sends prices — server computes them from the catalog.
const Body = z.object({
  items: z.array(ItemSchema).min(1),
  address: AddressSchema,
  coupon: z.string().nullable().optional(),
  paymentMethod: z.enum(["razorpay", "stripe"]),
});

/**
 * POST /api/orders  — create a pending order; payment is finalized in /razorpay or /stripe routes.
 * GET  /api/orders  — admin only: list orders (paginated).
 */
export async function POST(req: Request) {
  try {
    // Cross-instance rate limit (shared MongoDB store) — caps order-creation
    // spam per IP even when OTP is disabled. Fails open if the limiter errors.
    const rl = await rateLimit(`order:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = Body.parse(await req.json());

    if (otpEnabled()) {
      const token = await verifyCheckout(cookies().get(CHECKOUT_COOKIE)?.value);
      if (!contactMatches(token, body.address)) {
        return NextResponse.json({ error: "Please verify your contact with the OTP before ordering." }, { status: 401 });
      }
    }

    // Server-side price authority. A catalog item is re-priced (and re-named)
    // from the static catalog — the client price is ignored entirely. A
    // non-catalog item is only accepted if it is a genuine custom-cake request
    // (carries a `custom` payload), and even then its price is RECOMPUTED from
    // the authoritative custom-cake formula (lib/custom-cake) — never trusted
    // from the client. This closes the "send a real product with a bogus
    // productId + custom:{} + price:1" under-pricing hole; a forged item is
    // repriced to a real custom-cake price and its name is server-authoritative.
    const pricedItems = body.items.map((item) => {
      const product = item.productId
        ? PRODUCTS.find((p) => p.id === item.productId || p.slug === item.productId)
        : undefined;
      if (product) return { ...item, name: product.name, price: product.price };

      const c = item.custom as Record<string, unknown> | undefined;
      if (!c || typeof c !== "object") throw new Error("Unknown item");
      const spec = {
        base: typeof c.base === "string" ? c.base : null,
        flavor: typeof c.flavor === "string" ? c.flavor : undefined,
        weight: typeof c.weight === "string" ? c.weight : undefined,
        shape: typeof c.shape === "string" ? c.shape : undefined,
        eggless: c.eggless === true,
        hasImage: Boolean(c.image),
      };
      const price = priceCustomCake(spec);
      if (!price || price <= 0) throw new Error("Invalid item price");
      return { ...item, name: customCakeName(spec), price };
    });

    const subtotal = pricedItems.reduce((s, i) => s + i.price * i.qty, 0);
    // Delivery + coupon come from the shared pricing authority (lib/pricing) —
    // identical to the checkout UI, so the client can neither invent a discount
    // nor see a total different from what we charge.
    const { delivery, discount, total, coupon } = computeTotals(subtotal, body.coupon);

    await connectDB();
    const order = await Order.create({
      items: pricedItems,
      address: body.address,
      coupon,
      paymentMethod: body.paymentMethod,
      subtotal,
      delivery,
      discount,
      total,
      status: "pending",
      paymentStatus: "unpaid",
    });
    // Return the authoritative totals so the client can reconcile them against
    // what it displayed (catches stale cart prices before opening the payment
    // modal) — see checkout/page.tsx.
    return NextResponse.json({ id: order._id.toString(), ok: true, subtotal, delivery, discount, total });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }
    // Client-caused rejections (bad/unknown item) are 400; anything else is an
    // infra failure (DB down, etc.) and must be 503 so a transient outage isn't
    // reported to the customer as a bad request.
    if (e instanceof Error && (e.message === "Unknown item" || e.message === "Invalid item price")) {
      return NextResponse.json({ error: "One or more items are no longer available." }, { status: 400 });
    }
    logError("orders/POST", e);
    return NextResponse.json({ error: "Could not create order. Please try again." }, { status: 503 });
  }
}

// parseInt("abc") is NaN, and Math.max/min propagate NaN rather than
// ignoring it — so a non-numeric ?page=/?limit= used to reach Mongo's
// skip()/limit() as NaN instead of falling back to the default.
function intParam(raw: string | null, fallback: number): number {
  const n = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, intParam(searchParams.get("page"), 1));
    const limit = Math.min(50, Math.max(1, intParam(searchParams.get("limit"), 50)));
    const skip = (page - 1) * limit;

    await connectDB();
    const [orders, total] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Order.countDocuments(),
    ]);
    return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    logError("orders/GET", e);
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}
