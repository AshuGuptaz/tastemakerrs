import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * GET /api/orders/track?number=&phone=
 * Public order tracking. Returns a SAFE projection only (no address / email /
 * payment ids). Same 404 for "not found" and "phone mismatch" to avoid
 * order-number enumeration.
 */
export async function GET(req: Request) {
  const ip = getClientIp(req);
  const { ok } = await rateLimit(`track:${ip}`, 30, 60_000);
  if (!ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(req.url);
  const number = (url.searchParams.get("number") || "").trim();
  const phone = (url.searchParams.get("phone") || "").trim();

  if (!number || !phone) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  try {
    await connectDB();
    const order = await Order.findOne({ orderNumber: number }).lean();
    if (!order || (order as any).address?.phone !== phone) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const o = order as any;
    return NextResponse.json({
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      total: o.total,
      createdAt: o.createdAt,
      items: (o.items || []).map((i: any) => ({ name: i.name, qty: i.qty })),
    });
  } catch (e) {
    console.error("GET /api/orders/track failed:", e);
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
