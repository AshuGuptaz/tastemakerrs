import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateCoupon } from "@/lib/coupons";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  code: z.string().min(1).max(40),
  subtotal: z.number().positive().max(10_000_000),
  phone: z.string().max(20).optional(),
  email: z.string().max(200).optional(),
});

/**
 * POST /api/coupons/validate — instant feedback for the checkout "Apply" button.
 * Advisory only: /api/orders re-evaluates everything and is the authority. Returns
 * just the pricing rule (no usage counters) so the client can recompute the same
 * discount via lib/pricing if the subtotal changes. Rate-limited to blunt code guessing.
 */
export async function POST(req: Request) {
  try {
    const rl = await rateLimit(`coupon:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Please wait a minute." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }
    const parsed = Body.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Enter a coupon code." }, { status: 400 });
    const { code, subtotal, phone, email } = parsed.data;
    const r = await evaluateCoupon(code, subtotal, { phone, email });
    if (!r.ok) return NextResponse.json({ ok: false, error: r.error });
    return NextResponse.json({ ok: true, rule: r.rule, discount: r.discount, description: r.description ?? null });
  } catch (e) {
    logError("coupons/validate", e);
    return NextResponse.json({ ok: false, error: "Couldn't check that code right now. Please try again." }, { status: 500 });
  }
}
