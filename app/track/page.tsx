"use client";

import { useState } from "react";
import Link from "next/link";

type TrackResult = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: { name: string; qty: number }[];
};

export default function TrackOrderPage() {
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const qs = new URLSearchParams({
        number: number.trim(),
        phone: phone.trim(),
      });
      const res = await fetch(`/api/orders/track?${qs.toString()}`);
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      const data = (await res.json()) as TrackResult;
      setResult(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-cream-100 py-16 md:py-24 min-h-[70vh]">
      <div className="container-x">
        <Link href="/" className="text-sm text-cocoa/60 hover:text-flame">
          ← Back to home
        </Link>
        <h1 className="h-section mt-3">TRACK YOUR ORDER</h1>
        <p className="mt-3 max-w-xl text-cocoa/70">
          Enter your order number and the phone number on the order to see its
          current status.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="card p-6">
            <div className="mb-4">
              <label htmlFor="number" className="label">
                Order number
              </label>
              <input
                id="number"
                className="input"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. TM-1042"
                required
              />
            </div>
            <div className="mb-6">
              <label htmlFor="phone" className="label">
                Phone number
              </label>
              <input
                id="phone"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Tracking..." : "Track order"}
            </button>

            {notFound && (
              <p className="mt-4 text-sm text-flame">
                We couldn&apos;t find an order matching those details. Please
                double-check the order number and phone.
              </p>
            )}
          </form>

          {result && (
            <div className="card p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm text-cocoa/70">
                  {result.orderNumber}
                </span>
                <span className="rounded-pill bg-flame/10 px-3 py-1 text-xs font-semibold capitalize text-flame">
                  {result.status.replaceAll("_", " ")}
                </span>
              </div>

              <div className="mt-5 border-t border-cocoa/10 pt-4">
                <p className="label">Items</p>
                <ul className="space-y-1 text-sm text-cocoa/80">
                  {result.items.map((it, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{it.name}</span>
                      <span className="text-cocoa/60">×{it.qty}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-cocoa/10 pt-4">
                <div>
                  <p className="text-xs uppercase text-cocoa/50">Payment</p>
                  <p className="text-sm capitalize text-cocoa/80">
                    {result.paymentStatus}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-cocoa/50">Total</p>
                  <p className="font-display text-2xl">₹{result.total}</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-cocoa/50">
                Placed {new Date(result.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
