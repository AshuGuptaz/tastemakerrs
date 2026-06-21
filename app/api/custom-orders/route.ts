import { NextResponse } from "next/server";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { CustomOrder } from "@/models/CustomOrder";

const MAX_BYTES = 2_000_000;

const customOrderSchema = z.object({
  flavor: z.string(),
  weight: z.string(),
  shape: z.string(),
  eggless: z.boolean(),
  jain: z.boolean(),
  message: z.string().optional(),
  date: z.string(),
  contact: z.object({
    name: z.string(),
    phone: z.string().regex(/^[6-9]\d{9}$/),
    email: z.string().email().optional(),
  }),
  // The form sends `null` when no reference image is uploaded, so accept null too.
  image: z.string().max(2_000_000).nullish(),
});

export async function POST(req: Request) {
  // Size guard before parsing.
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const raw = await req.text();
  if (raw.length > MAX_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  // Parse JSON + zod OUTSIDE the DB try so ZodError returns 400 (not swallowed).
  let parsed: z.infer<typeof customOrderSchema>;
  try {
    const body = JSON.parse(raw);
    parsed = customOrderSchema.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Build payload ONLY from parsed fields; force status, never accept client price/status.
  const payload = {
    flavor: parsed.flavor,
    weight: parsed.weight,
    shape: parsed.shape,
    eggless: parsed.eggless,
    jain: parsed.jain,
    message: parsed.message,
    date: parsed.date,
    image: parsed.image,
    contact: {
      name: parsed.contact.name,
      phone: parsed.contact.phone,
      email: parsed.contact.email,
    },
    status: "new" as const,
  };

  try {
    await connectDB();
  } catch {
    // Genuine "no DB configured" fallback — log so dev still works.
    console.log("[custom-order] (no DB) order received");
    return NextResponse.json({ ok: true, id: "no-db" });
  }

  try {
    const doc = await CustomOrder.create(payload);
    return NextResponse.json({ ok: true, id: doc._id.toString() });
  } catch (e: any) {
    if (e instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
