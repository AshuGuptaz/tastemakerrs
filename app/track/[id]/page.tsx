"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { Check, PackageX, MapPin, CalendarClock } from "lucide-react";
import { STATUS_META, TRACK_STEPS, trackIndex, isCancelledLike } from "@/lib/order-status";
import type { OrderStatus } from "@/models/Order";

type Track = {
  id: string;
  status: OrderStatus;
  history: { status: OrderStatus; at: string }[];
  schedule: string | null;
  isGift: boolean;
  recipientName: string;
  firstName: string;
  city: string;
  items: { name: string; qty: number }[];
  placedAt: string;
};

export default function TrackPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<Track | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "notfound">("loading");

  useEffect(() => {
    fetch(`/api/track/${params.id}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => { setData(d); setState("ok"); })
      .catch(() => setState("notfound"));
  }, [params.id]);

  if (state === "loading") {
    return (
      <div className="container-x flex min-h-[50vh] items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-flame" />
      </div>
    );
  }

  if (state === "notfound" || !data) {
    return (
      <div className="container-x py-20 text-center">
        <PackageX className="mx-auto h-10 w-10 text-ink-mut/50" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">We couldn&apos;t find that order</h1>
        <p className="mt-2 text-ink-mut">The link may be old or incomplete. Check your confirmation email, or reach us on WhatsApp.</p>
        <Link href="/" className="btn-accent mt-6">Back home</Link>
      </div>
    );
  }

  const meta = STATUS_META[data.status];
  const cancelled = isCancelledLike(data.status);
  const currentIdx = trackIndex(data.status);
  const atFor = (s: OrderStatus) => data.history.find((h) => h.status === s)?.at;

  return (
    <div className="container-x max-w-2xl py-12 md:py-16">
      <p className="t-eyebrow text-flame">Order tracking</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tighter2 text-ink md:text-4xl">
        #{data.id.slice(-8).toUpperCase()}
      </h1>
      <p className="mt-1 text-ink-mut">Hi {data.firstName} — here&apos;s where your order is right now.</p>

      {/* Current status hero */}
      <div className={`mt-6 rounded-[1.5rem] border p-6 ${cancelled ? "border-red-200 bg-red-50/50" : "border-flame/20 bg-flame/5"}`}>
        <div className="flex items-center gap-4">
          <div className="text-4xl">{meta.emoji}</div>
          <div>
            <div className={`font-display text-2xl font-semibold ${cancelled ? "text-red-600" : "text-flame-700"}`}>{meta.label}</div>
            <p className="text-sm text-ink-soft">{meta.blurb}</p>
          </div>
        </div>
      </div>

      {/* Timeline stepper (hidden for cancelled/refunded) */}
      {!cancelled && (
        <ol className="mt-8 space-y-0">
          {TRACK_STEPS.map((step, i) => {
            const done = currentIdx >= 0 && i <= currentIdx;
            const isCurrent = i === currentIdx;
            const sMeta = STATUS_META[step];
            const at = atFor(step);
            const last = i === TRACK_STEPS.length - 1;
            return (
              <li key={step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <m.span
                    initial={false}
                    animate={{ scale: isCurrent ? 1.1 : 1 }}
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${
                      done ? "border-flame bg-flame text-white" : "border-line bg-white text-ink-mut"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4 stroke-[3]" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                  </m.span>
                  {!last && <span className={`w-0.5 flex-1 ${i < currentIdx ? "bg-flame" : "bg-line"}`} style={{ minHeight: 44 }} />}
                </div>
                <div className={`pb-8 ${done ? "" : "opacity-55"}`}>
                  <div className={`font-semibold ${isCurrent ? "text-flame-700" : "text-ink"}`}>{sMeta.label}</div>
                  <p className="text-sm text-ink-mut">{sMeta.blurb}</p>
                  {at && (
                    <p className="mt-0.5 text-xs text-ink-mut/80">
                      {new Date(at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Order details */}
      <div className="mt-6 space-y-4 rounded-2xl border border-line bg-white p-5">
        {data.schedule && (
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-flame" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-ink-mut">Scheduled delivery</div>
              <div className="text-sm text-ink">{data.schedule}</div>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-flame" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-mut">Delivering to</div>
            <div className="text-sm text-ink">
              {data.isGift && data.recipientName ? `${data.recipientName} (gift) · ` : ""}{data.city}
            </div>
          </div>
        </div>
        <div className="border-t border-line pt-3">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-ink-mut">Items</div>
          <ul className="text-sm text-ink-soft">
            {data.items.map((it, i) => (
              <li key={i}>{it.name}{it.qty > 1 ? ` × ${it.qty}` : ""}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-ink-mut">
        Questions about your order? <Link href="/contact" className="font-semibold text-flame hover:underline">Reach us here</Link>.
      </p>
    </div>
  );
}
