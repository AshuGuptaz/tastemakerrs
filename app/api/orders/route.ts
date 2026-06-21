import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { z } from "zod";
import { getAdminFromCookies } from "@/lib/auth-server";
import { recomputeOrder } from "@/lib/pricing";

const ItemSchema = z.object({
  productId: z.string().optional(),
  slug: z.string().optional(),
  name: z.string(),
  price: z.number().min(0),
  qty: z.number().int().min(1),
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

const Body = z.object({
  items: z.array(ItemSchema).min(1),
  address: AddressSchema,
  subtotal: z.number().min(0).optional(),
  delivery: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  total: z.number().min(0).optional(),
  coupon: z.string().nullable().optional(),
  paymentMethod: z.enum(["razorpay", "stripe"]),
});

/**
 * POST /api/orders  — create a pending order; payment is finalized in /razorpay or /stripe routes.
 * GET  /api/orders  — admin only: list orders.
 */
export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    await connectDB();

    // Server price authority: recompute every line price, subtotal, delivery,
    // discount and total. Client-supplied money fields are ignored entirely.
    const priced = recomputeOrder(body.items, body.coupon);
    const normalizedCoupon = (body.coupon || "").trim().toUpperCase() || null;

    const order = await Order.create({
      items: priced.items,
      address: body.address,
      subtotal: priced.subtotal,
      delivery: priced.delivery,
      discount: priced.discount,
      total: priced.total,
      coupon: normalizedCoupon,
      paymentMethod: body.paymentMethod,
      status: "pending",
      paymentStatus: "unpaid",
    });
    return NextResponse.json({ id: order._id.toString(), ok: true });
  } catch (e: any) {
    console.error("POST /api/orders failed:", e);
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json(orders);
}
