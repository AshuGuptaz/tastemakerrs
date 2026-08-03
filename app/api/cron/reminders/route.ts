import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { customerEmail, customerPhone } from "@/lib/customer";
import { formatDeliveryDate } from "@/lib/fulfillment";
import {
  emailConfigured,
  smsConfigured,
  sendEmail,
  sendSMS,
  occasionReminderEmailTemplate,
  occasionReminderSmsTemplate,
} from "@/lib/notify";
import { logError, logInfo } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Fire a reminder this many days before the occasion. The once-a-year guard
// (lastRemindedYear) means it sends exactly once even though a daily cron sees
// the occasion inside the window on several consecutive days.
const LEAD_DAYS = 7;

/** Days until the next occurrence of a recurring month/day, and that year. */
function nextOccurrence(month: number, day: number, from: Date) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day);
  const days = Math.round((next.getTime() - today.getTime()) / 86_400_000);
  return { days, year: next.getFullYear(), date: next };
}

function isoDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * GET /api/cron/reminders — scheduled daily by Vercel Cron (see vercel.json).
 *
 * Protected by CRON_SECRET: Vercel automatically sends
 * `Authorization: Bearer <CRON_SECRET>` on cron invocations. In production the
 * secret is required (fail closed); in dev it's optional so the job is testable.
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

  const now = new Date();
  let scanned = 0;
  let sent = 0;

  try {
    await connectDB();
    const customers = await Customer.find({ "occasions.remind": true });

    for (const c of customers) {
      let dirty = false;
      const email = customerEmail(c);
      const phone = customerPhone(c);

      for (const occ of c.occasions) {
        if (!occ.remind) continue;
        scanned++;
        const { days, year, date } = nextOccurrence(occ.month, occ.day, now);
        if (days < 0 || days > LEAD_DAYS) continue;
        if (occ.lastRemindedYear === year) continue; // already reminded this cycle

        const code = occ.type === "birthday" ? "BDAY150" : undefined;
        const dateText = formatDeliveryDate(isoDate(date));

        const [emailRes, smsRes] = await Promise.all([
          emailConfigured() && email
            ? sendEmail({
                to: email,
                subject: `🎉 ${occ.recipientName ? occ.recipientName + "'s" : "A"} ${occ.label} is coming up`,
                html: occasionReminderEmailTemplate({ greetingName: c.name, label: occ.label ?? "celebration", recipientName: occ.recipientName, dateText, daysAway: days, code }),
              })
            : Promise.resolve(null),
          smsConfigured() && phone
            ? sendSMS({ to: phone, body: occasionReminderSmsTemplate({ label: occ.label ?? "celebration", recipientName: occ.recipientName, daysAway: days, code }) })
            : Promise.resolve(null),
        ]);

        const ok = (r: unknown) => !!r && typeof r === "object" && "ok" in r && (r as { ok: boolean }).ok === true;
        // Mark reminded only if at least one channel actually delivered, so a
        // transient outage leaves it retry-eligible on the next daily run.
        if (ok(emailRes) || ok(smsRes)) {
          occ.lastRemindedYear = year;
          dirty = true;
          sent++;
        }
      }

      if (dirty) await c.save();
    }

    logInfo("cron/reminders", `scanned ${scanned} occasion(s), sent ${sent} reminder(s)`);
    return NextResponse.json({ ok: true, scanned, sent });
  } catch (e) {
    logError("cron/reminders", e);
    return NextResponse.json({ error: "Reminder job failed", scanned, sent }, { status: 500 });
  }
}
