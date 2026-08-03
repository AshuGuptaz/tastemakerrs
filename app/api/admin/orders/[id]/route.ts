import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { getAdminFromCookies } from "@/lib/auth-server";
import { updateOrderStatus } from "@/lib/order-status-update";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  status: z.enum(["pending", "paid", "in_kitchen", "out_for_delivery", "delivered", "cancelled", "refunded"]),
});

/** PATCH /api/admin/orders/:id — admin: advance an order's status (notifies the customer). */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    if (!mongoose.isValidObjectId(params.id)) {
      return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
    }
    const { status } = Body.parse(await req.json());
    const res = await updateOrderStatus(params.id, status);
    if (!res.ok) return NextResponse.json({ error: res.error || "Update failed" }, { status: 404 });
    return NextResponse.json({ ok: true, status });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "ZodError") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    logError("admin/orders/[id]/PATCH", e);
    return NextResponse.json({ error: "Could not update the order." }, { status: 500 });
  }
}
