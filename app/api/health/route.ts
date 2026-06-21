import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health — liveness + a quick DB ping. Info-light by design.
 */
export async function GET() {
  let db: "up" | "down" = "down";
  try {
    await connectDB();
    await mongoose.connection.db?.admin().ping();
    db = mongoose.connection.readyState === 1 ? "up" : "down";
  } catch {
    db = "down";
  }

  return NextResponse.json(
    { status: "ok", db },
    { status: db === "up" ? 200 : 503 }
  );
}
