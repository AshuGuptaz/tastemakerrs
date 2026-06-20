import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { z } from "zod";
import { getAdminFromCookies } from "@/lib/auth-server";

const ItemSchema = z.object({
  productId: z.string().optional(),
  name: z.string(),
  price: z.number(),
  qty: z.number().int().min(1),
  custom: z.any().optional(),
});

const AddressSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(4),
  notes: z.string().optional().default(""),
});

const Body = z.object({
  items: z.array(ItemSchema).min(1),
  address: AddressSchema,
  subtotal: z.number(),
  delivery: z.number(),
  discount: z.number(),
  total: z.number(),
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
    const order = await Order.create({ ...body, status: "pending", paymentStatus: "unpaid" });
    return NextResponse.json({ id: order._id.toString(), ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json(orders);
}
