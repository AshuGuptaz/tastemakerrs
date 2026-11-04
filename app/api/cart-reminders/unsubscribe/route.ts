import { connectDB } from "@/lib/mongodb";
import { CartReminder } from "@/models/CartReminder";
import { verifyUnsub } from "@/lib/cart-reminder";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const page = (title: string, msg: string, status = 200) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title></head><body style="margin:0;background:#FBF8F3;color:#1C1714;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;display:grid;place-items:center;min-height:100vh;padding:24px;text-align:center"><div style="max-width:420px"><h1 style="font-family:Georgia,serif;font-size:28px;margin:0 0 12px">${title}</h1><p style="color:#6E635B;line-height:1.6;margin:0 0 24px">${msg}</p><a href="/" style="display:inline-block;background:#D67A47;color:#fff;text-decoration:none;font-weight:600;border-radius:999px;padding:12px 24px">Back to The Taste Makerrs</a></div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );

/** GET /api/cart-reminders/unsubscribe?c=<customerId>&t=<hmac> — one-click opt-out from the email. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const c = url.searchParams.get("c") || "";
  const t = url.searchParams.get("t") || "";
  try {
    if (!c || !verifyUnsub(c, t)) return page("Link not valid", "This unsubscribe link looks incomplete or expired.", 400);
    await connectDB();
    await CartReminder.updateOne({ customerId: c }, { $set: { optedOut: true, items: [], sig: "" }, $setOnInsert: { remindedAt: null } }, { upsert: true });
    return page("You're unsubscribed", "We won't send you cart reminders any more. Order updates you request are not affected.");
  } catch (e) {
    logError("cart-reminders/unsubscribe", e);
    return page("Something went wrong", "Please try the link again in a moment.", 500);
  }
}
