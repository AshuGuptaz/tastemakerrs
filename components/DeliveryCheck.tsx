"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, CheckCircle2, Clock, MessageCircle } from "lucide-react";
import { isValidPincode, isServiceablePincode, sameDayStatus, formatMinutes } from "@/lib/delivery-area";
import { whatsappLink } from "@/lib/site";

const KEY = "ttm_pincode";

/**
 * "Can you deliver to me, and by when?" — answers the customer's #1 question on
 * the product page before they commit. Pincode is remembered on this device.
 * Guidance only: it never blocks adding to cart or checking out.
 */
export default function DeliveryCheck({ productName }: { productName?: string }) {
  const [pin, setPin] = useState("");
  const [now, setNow] = useState<Date | null>(null); // null until mounted → no SSR/CSR clock mismatch

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && isValidPincode(saved)) setPin(saved);
    } catch {}
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const onChange = (v: string) => {
    const clean = v.replace(/\D/g, "").slice(0, 6);
    setPin(clean);
    if (isValidPincode(clean)) {
      try { localStorage.setItem(KEY, clean); } catch {}
    }
  };

  const complete = pin.length === 6;
  const valid = isValidPincode(pin);
  const serviceable = valid && isServiceablePincode(pin);
  const sd = now ? sameDayStatus(now) : null;

  return (
    <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
      <label htmlFor="delivery-pin" className="flex items-center gap-2 text-sm font-semibold text-ink">
        <MapPin className="h-4 w-4 text-flame" /> Check delivery to your pincode
      </label>
      <input
        id="delivery-pin"
        inputMode="numeric"
        autoComplete="postal-code"
        placeholder="e.g. 226010"
        value={pin}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={complete && !valid}
        aria-describedby="delivery-pin-result"
        className="input mt-2.5 max-w-[11rem] tracking-widest"
      />

      <div id="delivery-pin-result" aria-live="polite" className="mt-3 text-sm">
        {!complete && <p className="text-ink-mut">We deliver across Lucknow. Enter your 6-digit pincode to see timing.</p>}

        {complete && !valid && <p className="text-flame-700">That doesn&apos;t look like a valid pincode — please check it.</p>}

        {serviceable && (
          <div className="space-y-1.5">
            <p className="flex items-center gap-2 font-semibold text-ink">
              <CheckCircle2 className="h-4 w-4 text-flame" /> Yes — we deliver to {pin}
            </p>
            {sd && (
              <p className="flex items-start gap-2 text-ink-soft">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-flame" />
                {sd.open ? (
                  <span>
                    Order within <strong>{formatMinutes(sd.minutesLeft)}</strong> for <strong>same-day delivery today</strong>.
                  </span>
                ) : (
                  <span>
                    Today&apos;s same-day cutoff (12 noon) has passed — order now for <strong>delivery tomorrow</strong>.
                  </span>
                )}
              </p>
            )}
          </div>
        )}

        {valid && !serviceable && (
          <div className="space-y-2">
            <p className="text-ink-soft">
              {pin} is outside our usual Lucknow delivery area. We may still be able to help.
            </p>
            <a
              href={whatsappLink(`Hi, can you deliver${productName ? ` the ${productName}` : ""} to pincode ${pin}?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-flame hover:text-flame-700"
            >
              <MessageCircle className="h-4 w-4" /> Ask us on WhatsApp
            </a>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-mut">
        Custom &amp; tiered cakes need 24–48 hours. <Link href="/delivery-policy" className="underline hover:text-flame">Delivery &amp; refund policy</Link>
      </p>
    </div>
  );
}
