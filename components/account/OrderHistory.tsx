"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw, Package, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/lib/products";
import { formatINR } from "@/lib/format";
import { STATUS_META, isCancelledLike } from "@/lib/order-status";
import type { OrderStatus } from "@/models/Order";

type OrderItem = { name: string; qty: number; price: number; variant?: string; productId?: string; custom?: unknown };
type OrderRow = {
  id: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: string;
  createdAt: string;
};

const CUSTOM_IMG = "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?auto=format&fit=crop&w=900&q=80";

export default function OrderHistory() {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState(false);
  const { add } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/account/orders", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setOrders(d.orders ?? []))
      .catch(() => setError(true));
  }, []);

  const reorder = (order: OrderRow) => {
    let added = 0;
    let skipped = 0;
    order.items.forEach((i, idx) => {
      if (i.custom) {
        add(
          {
            id: `custom-${order.id}-${idx}`,
            slug: "custom-cake",
            name: i.name,
            price: i.price,
            image: CUSTOM_IMG,
            custom: i.custom as Record<string, unknown>,
          },
          i.qty
        );
        added++;
        return;
      }
      const p = PRODUCTS.find((pp) => pp.id === i.productId || pp.slug === i.productId);
      if (!p) {
        skipped++;
        return;
      }
      // Re-price from the live catalog so the cart shows today's price, not the
      // historical one — the server would reprice it anyway.
      add({ id: p.id, slug: p.slug, name: p.name, price: p.price, image: p.image, variant: i.variant }, i.qty);
      added++;
    });

    if (added === 0) {
      toast.error("Those items are no longer available.");
      return;
    }
    toast.success(skipped ? `Added ${added} item${added > 1 ? "s" : ""} — ${skipped} no longer available` : "Added to your cart!");
    router.push("/cart");
  };

  if (error) {
    return <p className="text-sm text-ink-mut">Couldn&apos;t load your orders right now. Please refresh.</p>;
  }

  if (orders === null) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-cream-100" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-cream-50/50 px-6 py-10 text-center">
        <Package className="mx-auto h-8 w-8 text-ink-mut/50" />
        <p className="mt-3 text-ink-mut">No orders yet — your first cake is waiting.</p>
        <Link href="/menu" className="btn-accent mt-4">Browse the menu →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const meta = STATUS_META[o.status];
        return (
          <div key={o.id} className="rounded-2xl border border-line bg-white p-5 shadow-e1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-semibold text-ink">#{o.id.slice(-8).toUpperCase()}</span>
                  <span
                    className={`rounded-pill px-2.5 py-0.5 text-xs font-semibold ${
                      isCancelledLike(o.status) ? "bg-red-50 text-red-600" : "bg-flame/10 text-flame-700"
                    }`}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-mut">
                  {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-semibold text-ink">{formatINR(o.total)}</div>
                <div className="text-xs text-ink-mut">{o.items.reduce((s, i) => s + i.qty, 0)} item(s)</div>
              </div>
            </div>

            <p className="mt-3 line-clamp-1 text-sm text-ink-soft">
              {o.items.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(", ")}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => reorder(o)} className="btn-line group text-sm">
                <RotateCcw className="h-4 w-4 transition-transform group-hover:-rotate-45" />
                Reorder
              </button>
              {!isCancelledLike(o.status) && o.status !== "pending" && (
                <Link href={`/track/${o.id}`} className="btn-line text-sm">
                  <ExternalLink className="h-4 w-4" />
                  Track order
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
