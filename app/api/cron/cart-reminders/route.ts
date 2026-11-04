import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CartReminder } from "@/models/CartReminder";
import { Customer } from "@/models/Customer";
import { Order } from "@/models/Order";
import { customerEmail } from "@/lib/customer";
import { emailConfigured, sendEmail, cartReminderEmailTemplate } from "@/lib/notify";
import { isCartDue, signUnsub, MIN_AGE_H, MAX_AGE_H } from "@/lib/cart-reminder";
import { logError, logInfo } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thetastemakerrs.com";
const MAX_PER_RUN = 200;

/**
 * GET /api/cron/cart-reminders — daily (see vercel.json). Emails ONE reminder to
 * signed-in customers who left items in their cart (rules: lib/cart-reminder).
 * Same CRON_SECRET protection as /api/cron/reminders. Email only (no SMS —
 * promotional SMS in India needs DLT-registered templates). A customer with no
 * verified/known email is skipped and left untouched.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    if (req.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!emailConfigured()) return NextResponse.json({ ok: true, skipped: "email not configured" });

  const now = new Date();
  let scanned = 0;
  let sent = 0;

  try {
    await connectDB();
    const candidates = await CartReminder.find({
      optedOut: false,
      "items.0": { $exists: true },
      cartUpdatedAt: {
        $gte: new Date(now.getTime() - MAX_AGE_H * 3_600_000),
        $lte: new Date(now.getTime() - MIN_AGE_H * 3_600_000),
      },
    }).limit(MAX_PER_RUN);

    for (const snap of candidates) {
      scanned++;
      const paidSince = !!(await Order.exists({
        customerId: snap.customerId,
        paymentStatus: "paid",
        createdAt: { $gt: snap.cartUpdatedAt },
      }));
      if (!isCartDue({ itemCount: snap.items.length, cartUpdatedAt: snap.cartUpdatedAt, remindedAt: snap.remindedAt, optedOut: snap.optedOut }, now, paidSince)) continue;

      const customer = await Customer.findById(snap.customerId).catch(() => null);
      const email = customer ? customerEmail(customer) : null;
      if (!customer || !email) continue; // can't reach them — leave it untouched

      const res = await sendEmail({
        to: email,
        subject: "🎂 You left something sweet in your cart",
        html: cartReminderEmailTemplate({
          name: customer.name?.split(" ")[0],
          items: snap.items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
          cartUrl: `${SITE_URL}/cart`,
          unsubUrl: `${SITE_URL}/api/cart-reminders/unsubscribe?c=${encodeURIComponent(snap.customerId)}&t=${signUnsub(snap.customerId)}`,
        }),
      });
      // Mark reminded only if it was actually delivered, so a transient outage retries next run.
      if (res && typeof res === "object" && "ok" in res && (res as { ok: boolean }).ok) {
        snap.remindedAt = now;
        await snap.save();
        sent++;
      }
    }

    logInfo("cron/cart-reminders", `scanned ${scanned} cart(s), sent ${sent} reminder(s)`);
    return NextResponse.json({ ok: true, scanned, sent });
  } catch (e) {
    logError("cron/cart-reminders", e);
    return NextResponse.json({ error: "Cart reminder job failed", scanned, sent }, { status: 500 });
  }
}
