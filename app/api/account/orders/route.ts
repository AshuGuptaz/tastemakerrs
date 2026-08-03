import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getCustomerFromCookies } from "@/lib/customer-server";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/account/orders — this customer's order history.
 *
 * Matches by the linked customerId AND by any order whose address contact is a
 * channel this customer has proven — so orders placed as a guest BEFORE the
 * account existed still surface. Since you can only ever prove your own
 * channel, this never leaks another person's orders.
 */
export async function GET() {
  const claim = await getCustomerFromCookies();
  if (!claim) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  try {
    await connectDB();
    const or: Record<string, unknown>[] = [{ customerId: claim.cid }];
    if (claim.phone) or.push({ "address.phone": claim.phone });
    if (claim.email) or.push({ "address.email": claim.email });

    const orders = await Order.find({ $or: or, paymentStatus: { $ne: "unpaid" } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o._id.toString(),
        items: (o.items ?? []).map((i) => ({ name: i.name, qty: i.qty, price: i.price, variant: i.variant, productId: i.productId, custom: i.custom })),
        subtotal: o.subtotal,
        delivery: o.delivery,
        discount: o.discount,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt,
      })),
    });
  } catch (e) {
    logError("account/orders", e);
    return NextResponse.json({ error: "Could not load your orders." }, { status: 500 });
  }
}
