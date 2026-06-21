"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  _id: string;
  orderNumber?: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  address: { name: string; city: string; phone: string };
  items: { name: string; qty: number }[];
};

const STATUSES = [
  "pending",
  "paid",
  "in_kitchen",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    const prev = orders;
    setSaving(id);
    // Optimistic update.
    setOrders((os) => os.map((o) => (o._id === id ? { ...o, status } : o)));
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("update failed");
    } catch {
      // Roll back on failure.
      setOrders(prev);
    } finally {
      setSaving(null);
    }
  }

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-cream-50 py-12">
      <div className="container-x">
        <Link href="/admin" className="text-sm text-cocoa/60 hover:text-flame">← Back</Link>
        <h1 className="display text-[clamp(2rem,5vw,3.5rem)]">ORDERS</h1>

        {loading ? (
          <p className="mt-8 text-cocoa/60">Loading...</p>
        ) : orders.length === 0 ? (
          <p className="mt-8 text-cocoa/60">No orders yet.</p>
        ) : (
          <div className="card mt-8 overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-cream-100 text-left text-xs uppercase">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o._id} className={i % 2 ? "bg-cream-50" : ""}>
                    <td className="p-3 font-mono text-xs">{o.orderNumber || o._id.slice(-8)}</td>
                    <td className="p-3"><div className="font-semibold">{o.address.name}</div><div className="text-xs text-cocoa/60">{o.address.phone} · {o.address.city}</div></td>
                    <td className="p-3 text-xs">{o.items.map((it) => `${it.name} ×${it.qty}`).join(", ")}</td>
                    <td className="p-3 font-display text-lg">₹{o.total}</td>
                    <td className="p-3"><span className={`rounded-pill px-2 py-0.5 text-xs ${o.paymentStatus === "paid" ? "bg-flame/10 text-flame" : "bg-cocoa-50 text-cocoa/60"}`}>{o.paymentStatus} · {o.paymentMethod}</span></td>
                    <td className="p-3">
                      <select
                        className="rounded-pill border border-cocoa/15 bg-white px-2 py-1 text-xs capitalize focus:border-flame focus:outline-none focus:ring-2 focus:ring-flame/30"
                        value={o.status}
                        disabled={saving === o._id}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="capitalize">
                            {s.replaceAll("_", " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-xs text-cocoa/60">{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
