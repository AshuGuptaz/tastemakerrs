"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { m, useReducedMotion } from "framer-motion";
import { UploadCloud, X } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";
import { getBySlug } from "@/lib/products";
import DatePicker from "@/components/DatePicker";
import PageHeader from "@/components/ui/PageHeader";
import { formatINR } from "@/lib/format";
import {
  CUSTOM_FLAVORS as FLAVORS,
  CUSTOM_WEIGHTS as WEIGHTS,
  CUSTOM_SHAPES as SHAPES,
  priceCustomCake,
} from "@/lib/custom-cake";

function CustomCakeContent() {
  const sp = useSearchParams();
  const baseSlug = sp.get("base");
  const baseProduct = baseSlug ? getBySlug(baseSlug) : undefined;

  const [flavor, setFlavor] = useState<string>(FLAVORS[0].id);
  const [weight, setWeight] = useState<string>(WEIGHTS[0].id);
  const [shape, setShape] = useState<string>(SHAPES[0].id);
  const [eggless, setEggless] = useState(false);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  // Earliest selectable date = today + 48h lead time (TZ-safe, computed once)
  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const { add } = useCart();

  useEffect(() => {
    if (baseProduct) {
      const found = FLAVORS.find((f) =>
        baseProduct.flavors.some((bf) => f.id.includes(bf) || bf.includes(f.id))
      );
      if (found) setFlavor(found.id);
    }
  }, [baseProduct]);

  // Priced via the shared authority (lib/custom-cake) so the displayed number is
  // exactly what /api/orders recomputes and charges.
  const price = useMemo(
    () => priceCustomCake({ base: baseSlug, flavor, weight, shape, eggless, hasImage: !!imageData }),
    [flavor, weight, shape, eggless, imageData, baseSlug]
  );

  // Base64 inflates raw bytes by ~4/3, and the server caps the encoded data
  // URL at 2,000,000 chars (app/api/custom-orders/route.ts) — so the raw
  // file cap here MUST stay well under 1.5MB, not 4MB, or a passing preview
  // here still gets a silent 400 on submit. Keep these two in sync.
  const MAX_IMAGE_BYTES = 1.4 * 1024 * 1024;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be under 1.4 MB — try a smaller photo or a screenshot of it");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = async (addToCart = false) => {
    if (!name || !phone || !date) {
      toast.error("Please fill name, phone and delivery date");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        base: baseSlug ?? null, flavor, weight, shape, eggless, message, date, image: imageData,
        contact: { name, phone }, price,
      };
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed");

      if (addToCart) {
        add({
          id: `custom-${Date.now()}`,
          slug: "custom-cake",
          name: `Custom ${FLAVORS.find((f) => f.id === flavor)?.label} (${WEIGHTS.find((w) => w.id === weight)?.label})`,
          price,
          image: "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?auto=format&fit=crop&w=900&q=80",
          custom: payload,
        });
      }
      toast.success("Custom cake request received! We'll call to confirm.");
    } catch (e) {
      toast.error("Could not submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Customize"
        title={<>Design your <span className="text-gradient">dream</span> cake.</>}
        subtitle="Pick a flavour, weight and shape. Add a message, upload a photo for an edible print, and choose your delivery date — we'll call to confirm."
      />

      <section className="section bg-transparent">
        <div className="container-x grid gap-8 pb-28 lg:grid-cols-[1fr_380px] lg:pb-0">
          <m.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="space-y-8">
            {/* Flavor */}
            <div className="card p-6">
              <h3 className="t-h3">1 · Flavor</h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {FLAVORS.map((f) => (
                  <button key={f.id} type="button" onClick={() => setFlavor(f.id)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                      flavor === f.id ? "border-flame bg-flame/5 ring-2 ring-flame/30" : "border-line bg-white hover:border-line"
                    }`}>
                    <span className="font-semibold">{f.label}</span>
                    <span className="text-sm text-ink-mut">{f.price ? `+${formatINR(f.price)}` : "Included"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div className="card p-6">
              <h3 className="t-h3">2 · Weight</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {WEIGHTS.map((w) => (
                  <button key={w.id} type="button" onClick={() => setWeight(w.id)}
                    className={`rounded-pill px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                      weight === w.id ? "bg-flame text-white" : "bg-white border border-line hover:border-line"
                    }`}>
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape */}
            <div className="card p-6">
              <h3 className="t-h3">3 · Shape</h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {SHAPES.map((s) => (
                  <button key={s.id} type="button" onClick={() => setShape(s.id)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
                      shape === s.id ? "border-flame bg-flame/5 ring-2 ring-flame/30" : "border-line bg-white hover:border-line"
                    }`}>
                    <span className="font-semibold">{s.label}</span>
                    <span className="text-sm text-ink-mut">{s.price ? `+${formatINR(s.price)}` : "Included"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary */}
            <div className="card p-6">
              <h3 className="t-h3">4 · Diet</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <label className={`flex items-center gap-2 rounded-pill border px-4 py-2.5 cursor-pointer ${eggless ? "border-flame bg-flame/5" : "border-line bg-white"}`}>
                  <input type="checkbox" checked={eggless} onChange={(e) => setEggless(e.target.checked)} className="accent-flame" />
                  Eggless (+₹30)
                </label>
              </div>
            </div>

            {/* Message + image + date */}
            <div className="card p-6">
              <h3 className="t-h3">5 · Personalize</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label" htmlFor="cake-message">Message on cake</label>
                  <input id="cake-message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={40}
                    placeholder="e.g. Happy Birthday Riya!" className="input" />
                  <p className="mt-1 text-xs text-ink-mut">{message.length}/40</p>
                </div>
                <div>
                  <label className="label">Delivery date</label>
                  <DatePicker value={date} onChange={setDate} min={minDate} />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Reference image (optional, +₹150 for edible print)</label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-line bg-surface px-5 py-6 hover:border-flame">
                    <UploadCloud className="h-6 w-6 text-flame" />
                    <span className="text-sm text-ink-soft">{imageData ? "Image uploaded — click to change" : "Click to upload (max 4 MB)"}</span>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                  </label>
                  {imageData && (
                    <div className="relative mt-3 h-32 w-32">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageData} alt="Reference image for custom cake" className="h-full w-full rounded-2xl object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageData(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        aria-label="Remove reference image"
                        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink text-cream shadow-md transition hover:bg-flame focus-visible:outline focus-visible:outline-2 focus-visible:outline-flame"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="card p-6">
              <h3 className="t-h3">6 · Your details</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div><label className="label" htmlFor="cake-name">Name</label><input id="cake-name" required aria-required="true" value={name} onChange={(e) => setName(e.target.value)} className="input" /></div>
                <div><label className="label" htmlFor="cake-phone">Phone</label><input id="cake-phone" required aria-required="true" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="98765 43210" /></div>
              </div>
            </div>
          </m.div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="card p-6">
              <h3 className="t-h3">Your cake</h3>
              <div className="relative mt-4 aspect-square overflow-hidden rounded-2xl">
                <Image src="https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?auto=format&fit=crop&w=900&q=80" alt="Illustrative custom cake preview" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-pill bg-ink/70 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-white backdrop-blur">Illustrative — hand-finished to your design</span>
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-ink-mut">Flavor</span><span className="font-semibold">{FLAVORS.find((f) => f.id === flavor)?.label}</span></li>
                <li className="flex justify-between"><span className="text-ink-mut">Weight</span><span className="font-semibold">{WEIGHTS.find((w) => w.id === weight)?.label}</span></li>
                <li className="flex justify-between"><span className="text-ink-mut">Shape</span><span className="font-semibold">{SHAPES.find((s) => s.id === shape)?.label}</span></li>
                <li className="flex justify-between"><span className="text-ink-mut">Eggless</span><span className="font-semibold">{eggless ? "Yes" : "No"}</span></li>
                {message && <li className="flex justify-between"><span className="text-ink-mut">Message</span><span className="font-semibold truncate max-w-[60%]">"{message}"</span></li>}
                {date && <li className="flex justify-between"><span className="text-ink-mut">Delivery</span><span className="font-semibold">{new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></li>}
              </ul>
              <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
                <span className="t-h3">Total</span>
                <span className="font-display text-3xl text-flame-700">{formatINR(price)}</span>
              </div>
              <button onClick={() => submit(true)} disabled={submitting} className="btn-accent mt-5 hidden w-full justify-center lg:flex">
                {submitting ? "Submitting..." : "Add to Cart"}
              </button>
              <button onClick={() => submit(false)} disabled={submitting} className="btn-line mt-2 w-full justify-center">
                Just send a quote request
              </button>
              <p className="mt-3 text-xs text-ink-mut">We'll call you within 2 hours to confirm details and finalize design.</p>
            </div>
          </aside>
        </div>
      </section>

      {/* mobile sticky add bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-3 backdrop-blur lg:hidden">
        <div className="container-x flex items-center justify-between gap-4">
          <div className="leading-tight">
            <div className="text-[0.7rem] font-medium uppercase tracking-wide text-ink-mut">Total</div>
            <div className="font-display text-xl font-semibold text-flame-700">{formatINR(price)}</div>
          </div>
          <button onClick={() => submit(true)} disabled={submitting} className="btn-accent flex-1 justify-center" style={{ maxWidth: "62%" }}>
            {submitting ? "Submitting…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function CustomCakePage() {
  return (
    <Suspense
      fallback={
        <section className="bg-surface py-24">
          <div className="container-x text-center text-ink-mut">Loading the cake studio…</div>
        </section>
      }
    >
      <CustomCakeContent />
    </Suspense>
  );
}
