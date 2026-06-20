import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  // In production: send email via Resend / SendGrid, or push to Slack.
  console.log("[contact]", body);
  return NextResponse.json({ ok: true });
}
