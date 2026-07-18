import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { CustomOrder } from "@/models/CustomOrder";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";
import {
  emailConfigured,
  smsConfigured,
  sendEmail,
  sendSMS,
  customOrderAdminEmailTemplate,
  customOrderAdminSmsTemplate,
} from "@/lib/notify";

const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email().optional().or(z.literal("")),
});

const Body = z.object({
  base: z.string().max(100).nullable().optional(),
  flavor: z.string().min(1).max(100),
  weight: z.string().min(1).max(50),
  shape: z.string().min(1).max(50),
  eggless: z.boolean(),
  message: z.string().max(500).optional().default(""),
  date: z.string().min(1),
  // Data URL, base64-encoded — the client (app/custom-cake/page.tsx) caps the
  // raw file at 1.4MB for exactly this reason (base64 inflates ~4/3); keep
  // the two in sync or a passing client-side preview 400s here silently.
  image: z.string().max(2_000_000).optional(),
  contact: ContactSchema,
  price: z.number().nonnegative().optional().default(0),
});

export async function POST(req: Request) {
  const rl = await rateLimit(`custom-order:${clientIp(req)}`, { limit: 10, windowMs: 60_000 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let data: z.infer<typeof Body>;
  try {
    data = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  try {
    await connectDB();
    const doc = await CustomOrder.create({ ...data, status: "new" });

    // Notify staff a request came in — best-effort, must not fail the
    // customer's submission if delivery fails. Previously nothing alerted
    // anyone; requests were only discoverable via a direct DB query, despite
    // the page telling customers "we'll call you within 2 hours."
    const adminEmail = process.env.CONTACT_TO || "tastemakerrs@gmail.com";
    const adminPhone = process.env.CONTACT_PHONE || "8881661177";
    try {
      await Promise.all([
        emailConfigured()
          ? sendEmail({
              to: adminEmail,
              subject: `New custom cake request from ${data.contact.name}`,
              html: customOrderAdminEmailTemplate({
                name: data.contact.name,
                phone: data.contact.phone,
                email: data.contact.email || undefined,
                flavor: data.flavor,
                weight: data.weight,
                shape: data.shape,
                eggless: data.eggless,
                message: data.message,
                date: data.date,
                price: data.price,
                hasImage: !!data.image,
              }),
            })
          : Promise.resolve(null),
        smsConfigured()
          ? sendSMS({
              to: adminPhone,
              body: customOrderAdminSmsTemplate({
                name: data.contact.name,
                phone: data.contact.phone,
                flavor: data.flavor,
                weight: data.weight,
                date: data.date,
              }),
            })
          : Promise.resolve(null),
      ]);
    } catch (e) {
      logError("custom-orders/notify", e);
    }

    return NextResponse.json({ ok: true, id: doc._id.toString() });
  } catch (e: any) {
    // A DB failure must NOT report success — otherwise the customer thinks the
    // request was received while it's silently lost. Log without the PII payload.
    logError("custom-orders/POST", e);
    return NextResponse.json(
      { ok: false, error: "Could not submit your request. Please try again or call us." },
      { status: 503 }
    );
  }
}
