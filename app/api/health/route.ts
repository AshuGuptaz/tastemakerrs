import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health — uptime-monitor endpoint.
 *
 * 200 {"ok":true}  → site is up AND MongoDB answers a ping.
 * 503 {"ok":false} → the database is unreachable (paused cluster, bad
 *                    MONGODB_URI, network allowlist, …).
 *
 * Point a free monitor (UptimeRobot / Better Stack / Vercel cron) at this so an
 * outage emails you instead of being discovered by customers. Reveals nothing
 * about the cause — details go to the server log only. Pinging it every few
 * minutes also keeps a free-tier Atlas cluster from going idle.
 */
export async function GET() {
  const t0 = Date.now();
  try {
    await connectDB();
    await mongoose.connection.db!.admin().ping();
    return NextResponse.json({ ok: true, ms: Date.now() - t0 }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    logError("health", e);
    return NextResponse.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
