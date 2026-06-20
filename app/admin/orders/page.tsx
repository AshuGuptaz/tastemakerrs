"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Order = {
  _id: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  address: { name: string; city: string; phone: string };
  items: { name: string; qty: number }[];
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then((d) => {
      setOrders(Array.isArray(d) ? d : []);
      setLoading(false);
    });
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
                    <td className="p-3 font-mono text-xs">{o._id.slice(-8)}</td>
                    <td className="p-3"><div className="font-semibold">{o.address.name}</div><div className="text-xs text-cocoa/60">{o.address.phone} · {o.address.city}</div></td>
                    <td className="p-3 text-xs">{o.items.map((i) => `${i.name} ×${i.qty}`).join(", ")}</td>
                    <td className="p-3 font-display text-lg">₹{o.total}</td>
                    <td className="p-3"><span className={`rounded-pill px-2 py-0.5 text-xs ${o.paymentStatus === "paid" ? "bg-flame/10 text-flame" : "bg-cocoa-50 text-cocoa/60"}`}>{o.paymentStatus} · {o.paymentMethod}</span></td>
                    <td className="p-3 capitalize">{o.status.replaceAll("_", " ")}</td>
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
