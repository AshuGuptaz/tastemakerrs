import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { slotLabel, formatDeliveryDate } from "@/lib/fulfillment";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/track/:id — public order tracking by id (the link we email/SMS).
 *
 * The order id acts as a capability token, so we return ONLY non-sensitive
 * fields: status + timeline, schedule, item names, and a first-name/city. No
 * email, full phone, full address, payment ids or totals. Only orders that
 * actually went through (paid, or paid-then-refunded) are exposed — an
 * unpaid cart or a failed payment attempt never completed a real purchase,
 * so its tracking link 404s the same way, even though the customer already
 * holds that order id from checkout.
 */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    await connectDB();
    const o = await Order.findById(params.id).lean();
    if (!o || !["paid", "refunded"].includes(o.paymentStatus)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const firstName = (o.address?.name || "").trim().split(/\s+/)[0] || "there";
    const schedule = o.fulfillment?.date
      ? `${formatDeliveryDate(o.fulfillment.date)}${o.fulfillment.slot ? ` · ${slotLabel(o.fulfillment.slot)}` : ""}`
      : null;

    return NextResponse.json({
      id: o._id.toString(),
      status: o.status,
      history: (o.statusHistory ?? []).map((h) => ({ status: h.status, at: h.at })),
      schedule,
      isGift: !!o.gift?.isGift,
      recipientName: o.gift?.isGift ? o.gift?.recipientName ?? "" : "",
      firstName,
      city: o.address?.city || "",
      items: (o.items ?? []).map((i) => ({ name: i.name, qty: i.qty })),
      placedAt: o.createdAt,
    });
  } catch (e) {
    logError("track/[id]", e);
    return NextResponse.json({ error: "Could not load tracking." }, { status: 500 });
  }
}
