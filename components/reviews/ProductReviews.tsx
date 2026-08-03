"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { ImagePlus, X, MessageSquarePlus, BadgeCheck } from "lucide-react";
import toast from "react-hot-toast";
import Stars from "@/components/reviews/Stars";
import { useCustomer } from "@/context/CustomerContext";

type ReviewDTO = {
  id: string;
  rating: number;
  title: string;
  body: string;
  photos: string[];
  authorName: string;
  createdAt: string;
};
type Summary = { count: number; average: number; distribution: Record<string, number> };

const MAX_PHOTOS = 4;
const MAX_PHOTO_BYTES = 650 * 1024;

export default function ProductReviews({ productId, productName }: { productId: string; productName: string }) {
  const { signedIn } = useCustomer();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [writing, setWriting] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/reviews?productId=${encodeURIComponent(productId)}`, { cache: "no-store" });
      const d = await r.json();
      if (r.ok) {
        setSummary(d.summary);
        setReviews(d.reviews ?? []);
        setCanReview(!!d.canReview);
        setHasReviewed(!!d.hasReviewed);
      }
    } catch { /* leave empty */ }
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="section bg-transparent" id="reviews">
      <div className="container-x">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="t-h2">Reviews</h2>
          {canReview && !hasReviewed && !writing && (
            <button onClick={() => setWriting(true)} className="btn-accent">
              <MessageSquarePlus className="h-4 w-4" /> Write a review
            </button>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 flex flex-wrap items-center gap-8">
          <div className="text-center">
            <div className="font-display text-5xl font-semibold text-ink">{summary?.average?.toFixed(1) ?? "—"}</div>
            <div className="mt-1"><Stars value={summary?.average ?? 0} /></div>
            <div className="mt-1 text-xs text-ink-mut">{summary?.count ?? 0} review{summary?.count === 1 ? "" : "s"}</div>
          </div>
          {!!summary?.count && (
            <div className="min-w-[200px] flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const n = summary.distribution?.[star] ?? 0;
                const pct = summary.count ? (n / summary.count) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs text-ink-mut">
                    <span className="w-3">{star}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cream-100">
                      <div className="h-full rounded-full bg-flame" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right">{n}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Write form / prompts */}
        <AnimatePresence initial={false}>
          {writing && (
            <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <ReviewForm
                productId={productId}
                productName={productName}
                onDone={() => { setWriting(false); setHasReviewed(true); load(); }}
                onCancel={() => setWriting(false)}
              />
            </m.div>
          )}
        </AnimatePresence>

        {!signedIn && (
          <p className="mt-6 rounded-2xl border border-dashed border-line bg-cream-50/60 px-5 py-4 text-sm text-ink-mut">
            <Link href="/account" className="font-semibold text-flame hover:underline">Sign in</Link> to leave a review — reviews are open to verified buyers only.
          </p>
        )}
        {signedIn && !canReview && !hasReviewed && (
          <p className="mt-6 rounded-2xl border border-dashed border-line bg-cream-50/60 px-5 py-4 text-sm text-ink-mut">
            Only verified buyers can review. Order this cake and share your thoughts afterwards!
          </p>
        )}
        {hasReviewed && !writing && (
          <p className="mt-6 flex items-center gap-2 text-sm text-flame-700">
            <BadgeCheck className="h-4 w-4" /> Thanks for your review — it&apos;s live once approved.
          </p>
        )}

        {/* List */}
        <div className="mt-8 space-y-5">
          {reviews.length === 0 ? (
            <p className="text-ink-mut">No reviews yet — be the first to share how it tasted.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-line bg-white p-5 shadow-e1">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-flame/10 font-display text-sm font-semibold text-flame-700">
                      {r.authorName.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                        {r.authorName}
                        <span className="flex items-center gap-0.5 rounded-pill bg-flame/10 px-1.5 py-0.5 text-[0.6rem] font-semibold text-flame-700"><BadgeCheck className="h-2.5 w-2.5" /> Verified</span>
                      </div>
                      <div className="text-xs text-ink-mut">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    </div>
                  </div>
                  <Stars value={r.rating} size="sm" />
                </div>
                {r.title && <h3 className="mt-3 font-display text-lg font-semibold text-ink">{r.title}</h3>}
                <p className="mt-1 leading-relaxed text-ink-soft">{r.body}</p>
                {r.photos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.photos.map((src, i) => (
                      <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
                        <Image src={src} alt={`Review photo ${i + 1}`} fill sizes="80px" className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewForm({
  productId,
  productName,
  onDone,
  onCancel,
}: {
  productId: string;
  productName: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    for (const f of Array.from(files)) {
      if (photos.length >= MAX_PHOTOS) { toast.error(`Up to ${MAX_PHOTOS} photos`); break; }
      if (f.size > MAX_PHOTO_BYTES) { toast.error("Each photo must be under ~650KB"); continue; }
      const reader = new FileReader();
      reader.onload = () => setPhotos((p) => (p.length < MAX_PHOTOS ? [...p, reader.result as string] : p));
      reader.readAsDataURL(f);
    }
  };

  const submit = async () => {
    if (rating < 1) return toast.error("Please pick a star rating");
    if (body.trim().length < 3) return toast.error("Please write a short review");
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body, photos }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Could not submit");
      toast.success(d.message || "Thanks for your review!");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit your review.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-e1 md:p-6">
      <h3 className="font-display text-xl font-semibold text-ink">Review {productName}</h3>
      <div className="mt-4">
        <label className="label">Your rating</label>
        <Stars value={rating} onChange={setRating} size="lg" />
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="rv-title">Title <span className="font-normal text-ink-mut">(optional)</span></label>
        <input id="rv-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Sum it up in a few words" className="input" />
      </div>
      <div className="mt-4">
        <label className="label" htmlFor="rv-body">Your review</label>
        <textarea id="rv-body" rows={4} value={body} onChange={(e) => setBody(e.target.value)} maxLength={2000} placeholder="How did it taste? How was the delivery and presentation?" className="input" />
      </div>
      <div className="mt-4">
        <label className="label">Photos <span className="font-normal text-ink-mut">(optional, up to {MAX_PHOTOS})</span></label>
        <div className="flex flex-wrap gap-2">
          {photos.map((src, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
              <Image src={src} alt={`Upload ${i + 1}`} fill sizes="80px" className="object-cover" unoptimized />
              <button onClick={() => setPhotos((p) => p.filter((_, x) => x !== i))} aria-label="Remove photo" className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-ink/70 text-white">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button onClick={() => fileRef.current?.click()} className="grid h-20 w-20 place-items-center rounded-xl border border-dashed border-line text-ink-mut transition hover:border-flame hover:text-flame">
              <ImagePlus className="h-6 w-6" />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button onClick={submit} disabled={busy} className="btn-accent disabled:opacity-50">{busy ? "Submitting…" : "Submit review"}</button>
        <button onClick={onCancel} className="btn-line">Cancel</button>
      </div>
    </div>
  );
}
