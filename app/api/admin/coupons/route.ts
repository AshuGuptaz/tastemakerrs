import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Coupon } from "@/models/Coupon";
import { Order } from "@/models/Order";
import { getAdminFromCookies } from "@/lib/auth-server";
import { ensureSeeded } from "@/lib/coupons";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const optNum = z.number().nonnegative().max(10_000_000).nullable().optional();
const optDate = z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).nullable().optional();

const Fields = z.object({
  description: z.string().max(200).optional(),
  kind: z.enum(["percent", "flat"]),
  value: z.number().positive().max(10_000_000),
  minSubtotal: optNum,
  maxDiscount: optNum,
  startsAt: optDate,
  expiresAt: optDate,
  usageLimit: z.number().int().min(1).max(1_000_000).nullable().optional(),
  firstOrderOnly: z.boolean().optional(),
  oncePerContact: z.boolean().optional(),
  active: z.boolean().optional(),
});

const refine = (v: { kind?: string; value?: number }) => !(v.kind === "percent" && (v.value ?? 0) > 100);
const CreateBody = Fields.extend({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,32}$/, "Code: 3–32 letters, digits, - or _") })
  .refine(refine, { message: "A percent coupon can't exceed 100", path: ["value"] });
const UpdateBody = Fields.partial().extend({ id: z.string() })
  .refine(refine, { message: "A percent coupon can't exceed 100", path: ["value"] });

/** Dates arrive as YYYY-MM-DD (date input) or ISO; an end date means "through the end of that day" (IST). */
function toDate(v: string | null | undefined, endOfDay = false): Date | null | undefined {
  if (v === undefined) return undefined;
  if (v === null || v === "") return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(`${v}T${endOfDay ? "23:59:59" : "00:00:00"}+05:30`);
  return new Date(v);
}

function split(o: Record<string, unknown>) {
  // null → unset (so "clear this limit" works); undefined → untouched
  const set: Record<string, unknown> = {};
  const unset: Record<string, 1> = {};
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined) continue;
    if (v === null) unset[k] = 1; else set[k] = v;
  }
  return { set, unset };
}

/** GET /api/admin/coupons — all coupons with live paid-redemption counts. */
export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureSeeded();
    const [coupons, usage] = await Promise.all([
      Coupon.find().sort({ createdAt: 1 }).lean(),
      Order.aggregate<{ _id: string; n: number }>([
        { $match: { coupon: { $ne: null }, paymentStatus: { $in: ["paid", "refunded"] } } },
        { $group: { _id: "$coupon", n: { $sum: 1 } } },
      ]),
    ]);
    const used = new Map(usage.map((u) => [u._id, u.n]));
    return NextResponse.json({
      coupons: coupons.map((c) => ({
        id: c._id.toString(), code: c.code, description: c.description ?? "", kind: c.kind, value: c.value,
        minSubtotal: c.minSubtotal ?? null, maxDiscount: c.maxDiscount ?? null,
        startsAt: c.startsAt ?? null, expiresAt: c.expiresAt ?? null, usageLimit: c.usageLimit ?? null,
        firstOrderOnly: !!c.firstOrderOnly, oncePerContact: !!c.oncePerContact, active: c.active,
        used: used.get(c.code) ?? 0,
      })),
    });
  } catch (e) {
    logError("admin/coupons/GET", e);
    return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
  }
}

/** POST /api/admin/coupons — create a coupon. */
export async function POST(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = CreateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid coupon" }, { status: 400 });
  try {
    await connectDB();
    const { startsAt, expiresAt, ...rest } = parsed.data;
    const { set } = split({ ...rest, startsAt: toDate(startsAt), expiresAt: toDate(expiresAt, true) });
    await Coupon.create(set);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    if ((e as { code?: number })?.code === 11000) return NextResponse.json({ error: "That code already exists" }, { status: 409 });
    logError("admin/coupons/POST", e);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

/** PATCH /api/admin/coupons — edit a coupon or toggle `active`. The code itself is immutable. */
export async function PATCH(req: Request) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = UpdateBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid coupon" }, { status: 400 });
  const { id, startsAt, expiresAt, ...rest } = parsed.data;
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  try {
    await connectDB();
    // `refine` only sees the fields in this request — re-check the cap against the stored kind.
    if (rest.value !== undefined && rest.kind === undefined) {
      const existing = await Coupon.findById(id).select("kind").lean();
      if (existing?.kind === "percent" && rest.value > 100) {
        return NextResponse.json({ error: "A percent coupon can't exceed 100" }, { status: 400 });
      }
    }
    const { set, unset } = split({ ...rest, startsAt: toDate(startsAt), expiresAt: toDate(expiresAt, true) });
    const res = await Coupon.updateOne({ _id: id }, { ...(Object.keys(set).length ? { $set: set } : {}), ...(Object.keys(unset).length ? { $unset: unset } : {}) });
    if (res.matchedCount === 0) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    logError("admin/coupons/PATCH", e);
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}
