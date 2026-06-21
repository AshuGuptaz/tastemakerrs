import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getAdminFromCookies } from "@/lib/auth-server";

/**
 * GET   /api/orders/:id — public: SAFE projection only (no PII / no items).
 * PATCH /api/orders/:id — admin only: update order status (never money fields).
 */

const statusSchema = z
  .object({
    status: z.enum([
      "pending",
      "paid",
      "in_kitchen",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "refunded",
    ]),
  })
  .strict();

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  try {
    await connectDB();
    const order = await Order.findById(params.id, "status paymentStatus total createdAt orderNumber").lean();
    if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(order);
  } catch (e) {
    console.error("GET /api/orders/[id] failed:", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid request" }, { status: 400 });
    }
    const { status } = parsed.data;
    const updated = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!updated) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ ok: true, status });
  } catch (e) {
    console.error("PATCH /api/orders/[id] failed:", e);
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}
