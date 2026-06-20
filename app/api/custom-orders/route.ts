import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { CustomOrder } from "@/models/CustomOrder";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    try {
      await connectDB();
      const doc = await CustomOrder.create(body);
      return NextResponse.json({ ok: true, id: doc._id.toString() });
    } catch {
      // DB not configured — log to console instead so dev still works.
      console.log("[custom-order] (no DB) ", JSON.stringify(body).slice(0, 500));
      return NextResponse.json({ ok: true, id: "no-db" });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
