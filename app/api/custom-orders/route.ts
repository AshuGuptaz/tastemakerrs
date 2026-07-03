import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { CustomOrder } from "@/models/CustomOrder";

const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email().optional().or(z.literal("")),
});

const Body = z.object({
  flavor: z.string().min(1).max(100),
  weight: z.string().min(1).max(50),
  shape: z.string().min(1).max(50),
  eggless: z.boolean(),
  jain: z.boolean(),
  message: z.string().max(500).optional().default(""),
  date: z.string().min(1),
  image: z.string().max(2_000_000).optional(), // data URL or upload URL
  contact: ContactSchema,
  price: z.number().nonnegative().optional().default(0),
});

export async function POST(req: Request) {
  let data: z.infer<typeof Body>;
  try {
    data = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  try {
    await connectDB();
    const doc = await CustomOrder.create({ ...data, status: "new" });
    return NextResponse.json({ ok: true, id: doc._id.toString() });
  } catch {
    console.log("[custom-order] (no DB) ", JSON.stringify(data).slice(0, 500));
    return NextResponse.json({ ok: true, id: "no-db" });
  }
}
