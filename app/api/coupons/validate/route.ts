import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { resolveCoupon } from "@/lib/coupons";

const Body = z.object({
  code: z.string().max(64).nullish(),
  subtotal: z.number().min(0),
});

/**
 * POST /api/coupons/validate — { code, subtotal } -> { discount }.
 * Rate-limited per IP; server is the authority on coupon value.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { ok } = await rateLimit(`coupon:${ip}`, 20, 60_000);
  if (!ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const discount = await resolveCoupon(parsed.code, parsed.subtotal);
  return NextResponse.json({ discount });
}
