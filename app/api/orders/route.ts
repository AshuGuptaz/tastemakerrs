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

// Delivery + coupon rules MUST match what the checkout UI displays, otherwise the
// amount charged (server-computed) diverges from the total the customer agreed to.
const DELIVERY_FEE = 79;
const FREE_DELIVERY_ABOVE = 999;

// Server-side coupon authority — mirrors the checkout page's couponValue() so a
// client can never invent a discount, and the charged total matches the display.
function couponValue(code: string, subtotal: number): number {
  const map: Record<string, number> = {
    FIRSTBITE: Math.round(subtotal * 0.1),
    BDAY150: subtotal >= 999 ? 150 : 0,
    HAMPER20: Math.round(subtotal * 0.2),
    BULK10: subtotal >= 3000 ? Math.round(subtotal * 0.1) : 0,
  };
  return map[code] || 0;
}

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
    // (carries a `custom` payload); otherwise it is rejected. This closes the
    // "send a real product with no/bogus productId and price:1" under-pricing hole.
    const pricedItems = body.items.map((item) => {
      const product = item.productId
        ? PRODUCTS.find((p) => p.id === item.productId || p.slug === item.productId)
        : undefined;
      if (product) return { ...item, name: product.name, price: product.price };
      if (!item.custom) throw new Error("Unknown item");
      if (!item.price || item.price <= 0) throw new Error("Invalid item price");
      return item;
    });

    const subtotal = pricedItems.reduce((s, i) => s + i.price * i.qty, 0);
    const delivery = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
    // Coupon is re-validated & re-priced server-side from the authoritative
    // subtotal — the client can neither invent a code nor inflate the discount.
    const discount = body.coupon ? couponValue(body.coupon.trim().toUpperCase(), subtotal) : 0;
    const total = Math.max(0, subtotal + delivery - discount);

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
