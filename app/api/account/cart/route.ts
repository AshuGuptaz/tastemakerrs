import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { CartReminder } from "@/models/CartReminder";
import { getCustomerFromCookies } from "@/lib/customer-server";
import { cartSignature } from "@/lib/cart-reminder";
import { rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(80),
        name: z.string().min(1).max(120),
        price: z.number().min(0).max(1_000_000),
        qty: z.number().int().min(1).max(50),
        variant: z.string().max(60).optional(),
        image: z.string().max(300).optional(),
      })
    )
    .max(50),
});

/**
 * PUT /api/account/cart — mirror the signed-in customer's cart so we can send
 * ONE abandoned-cart email. Only a real change in contents bumps the "last
 * touched" time (a re-sync of the same cart must not keep postponing the nudge).
 * Never alters reminder state (remindedAt / optedOut).
 */
export async function PUT(req: Request) {
  try {
    const claim = await getCustomerFromCookies();
    if (!claim) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rl = await rateLimit(`cartsync:${claim.cid}`, { limit: 120, windowMs: 60 * 60 * 1000 });
    if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
    const { items } = parsed.data;

    await connectDB();
    const sig = cartSignature(items);
    const existing = await CartReminder.findOne({ customerId: claim.cid }).select("sig").lean();

    if (!existing) {
      if (items.length === 0) return NextResponse.json({ ok: true }); // nothing to remember
      await CartReminder.create({ customerId: claim.cid, items, sig, cartUpdatedAt: new Date() }).catch((e) => {
        if (e?.code !== 11000) throw e; // lost a create race → the next sync updates it
      });
    } else if (existing.sig !== sig) {
      await CartReminder.updateOne({ customerId: claim.cid }, { $set: { items, sig, cartUpdatedAt: new Date() } });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    logError("account/cart PUT", e);
    return NextResponse.json({ error: "Could not save cart" }, { status: 500 });
  }
}
