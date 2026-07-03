import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { z } from "zod";
import { getAdminFromCookies } from "@/lib/auth-server";
import { otpEnabled } from "@/lib/notify";
import { verifyCheckout, contactMatches, CHECKOUT_COOKIE } from "@/lib/checkout-token";
import { PRODUCTS } from "@/lib/products";

export const runtime = "nodejs";

const DELIVERY_FEE = 50;
const FREE_DELIVERY_ABOVE = 500;

const ItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string(),
  price: z.number().positive(),
  qty: z.number().int().min(1),
  variant: z.string().optional(),
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
    const body = Body.parse(await req.json());

    if (otpEnabled()) {
      const token = await verifyCheckout(cookies().get(CHECKOUT_COOKIE)?.value);
      if (!contactMatches(token, body.address)) {
        return NextResponse.json({ error: "Please verify your contact with the OTP before ordering." }, { status: 401 });
      }
    }

    // Server-side price authority: look up each item in the static catalog.
    // Items with a known productId get the catalog price; unrecognized items
    // (e.g. custom cakes added via the custom-order flow) keep the submitted
    // price but must be positive — client can never under-price catalog items.
    const pricedItems = body.items.map((item) => {
      if (item.productId) {
        const product = PRODUCTS.find((p) => p.id === item.productId || p.slug === item.productId);
        if (product) return { ...item, price: product.price };
      }
      if (!item.price || item.price <= 0) throw new Error("Invalid item price");
      return item;
    });

    const subtotal = pricedItems.reduce((s, i) => s + i.price * i.qty, 0);
    const delivery = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    // TODO: validate coupon code server-side when coupon table is implemented.
    const discount = 0;
    const total = subtotal + delivery - discount;

    await connectDB();
    const order = await Order.create({
      items: pricedItems,
      address: body.address,
      coupon: body.coupon ?? null,
      paymentMethod: body.paymentMethod,
      subtotal,
      delivery,
      discount,
      total,
      status: "pending",
      paymentStatus: "unpaid",
    });
    return NextResponse.json({ id: order._id.toString(), ok: true });
  } catch (e: any) {
    if (e?.name === "ZodError") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }
    console.error("[orders/POST]", e?.message);
    return NextResponse.json({ error: "Could not create order" }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
  const skip = (page - 1) * limit;

  await connectDB();
  const [orders, total] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(),
  ]);
  return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
}
