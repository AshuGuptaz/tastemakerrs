"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Check, X } from "lucide-react";

type AdminReview = {
  id: string;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  body: string;
  photos: string[];
  authorName: string;
  status: string;
  createdAt: string;
};

const TABS = ["pending", "approved", "rejected"] as const;

export default function AdminReviews() {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("pending");
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    (status: string) => {
      setLoading(true);
      fetch(`/api/admin/reviews?status=${status}`)
        .then(async (r) => {
          if (r.status === 401) { router.push("/admin/login"); return null; }
          return r.json();
        })
        .then((d) => setReviews(d && Array.isArray(d.reviews) ? d.reviews : []))
        .catch(() => setReviews([]))
        .finally(() => setLoading(false));
    },
    [router]
  );

  useEffect(() => { load(tab); }, [tab, load]);

  const moderate = async (id: string, status: "approved" | "rejected") => {
    setReviews((rs) => rs.filter((r) => r.id !== id)); // optimistic remove from current tab
    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      load(tab); // rollback by reloading
    }
  };

  return (
    <section className="bg-cream-50 py-12">
      <div className="container-x">
        <Link href="/admin" className="text-sm text-cocoa/60 hover:text-flame">← Back</Link>
        <h1 className="display text-[clamp(2rem,5vw,3.5rem)]">REVIEWS</h1>

        <div className="mt-6 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-pill px-4 py-1.5 text-sm font-semibold capitalize transition ${tab === t ? "bg-flame text-white" : "bg-white text-cocoa/70 hover:text-flame"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-8 text-cocoa/60">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="mt-8 text-cocoa/60">No {tab} reviews.</p>
        ) : (
          <div className="mt-8 space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.authorName}</span>
                      <span className="flex items-center gap-0.5 text-sm text-flame">
                        {Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-flame" strokeWidth={0} />)}
                      </span>
                    </div>
                    <div className="text-xs text-cocoa/60">
                      {r.productName} · {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {tab === "pending" && (
                    <div className="flex gap-2">
                      <button onClick={() => moderate(r.id, "approved")} className="flex items-center gap-1 rounded-pill bg-flame px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90">
                        <Check className="h-4 w-4" /> Approve
                      </button>
                      <button onClick={() => moderate(r.id, "rejected")} className="flex items-center gap-1 rounded-pill border border-line bg-white px-3 py-1.5 text-sm font-semibold text-cocoa/70 hover:text-red-500">
                        <X className="h-4 w-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
                {r.title && <h3 className="mt-3 font-display text-lg">{r.title}</h3>}
                <p className="mt-1 text-sm text-cocoa/80">{r.body}</p>
                {r.photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.photos.map((src, i) => (
                      <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
                        <Image src={src} alt={`Photo ${i + 1}`} fill sizes="80px" className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
