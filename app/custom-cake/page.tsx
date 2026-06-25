"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { UploadCloud, X } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";
import { getBySlug } from "@/lib/products";
import DatePicker from "@/components/DatePicker";
import PageHeader from "@/components/ui/PageHeader";

const FLAVORS = [
  { id: "vanilla", label: "Classic Vanilla", price: 0 },
  { id: "chocolate", label: "Rich Chocolate", price: 50 },
  { id: "red-velvet", label: "Red Velvet", price: 100 },
  { id: "rasmalai", label: "Rasmalai Fusion", price: 150 },
  { id: "pistachio", label: "Luxury Pistachio", price: 250 },
];
const WEIGHTS = [
  { id: "500g", label: "500 g", multiplier: 1 },
  { id: "1kg", label: "1 kg", multiplier: 1.8 },
  { id: "1.5kg", label: "1.5 kg", multiplier: 2.6 },
  { id: "2kg", label: "2 kg", multiplier: 3.4 },
];
const SHAPES = [
  { id: "round", label: "Round", price: 0 },
  { id: "square", label: "Square", price: 50 },
  { id: "heart", label: "Heart", price: 100 },
  { id: "tier", label: "Two-Tier", price: 400 },
];

function CustomCakeContent() {
  const sp = useSearchParams();
  const baseSlug = sp.get("base");
  const baseProduct = baseSlug ? getBySlug(baseSlug) : undefined;

  const [flavor, setFlavor] = useState(FLAVORS[0].id);
  const [weight, setWeight] = useState(WEIGHTS[0].id);
  const [shape, setShape] = useState(SHAPES[0].id);
  const [eggless, setEggless] = useState(true);
  const [jain, setJain] = useState(false);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  // Earliest selectable date from the local calendar day (TZ-safe, computed once)
  const minDate = useMemo(() => {
    const d = new Date();
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

  const price = useMemo(() => {
    const basePrice = (baseProduct?.price || 600);
    const flavorAdd = FLAVORS.find((f) => f.id === flavor)?.price || 0;
    const shapeAdd = SHAPES.find((s) => s.id === shape)?.price || 0;
    const mult = WEIGHTS.find((w) => w.id === weight)?.multiplier || 1;
    const customAdd = (jain ? 100 : 0) + (eggless ? 30 : 0) + (imageData ? 150 : 0);
    return Math.round((basePrice + flavorAdd + shapeAdd) * mult + customAdd);
  }, [flavor, weight, shape, eggless, jain, imageData, baseProduct]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) {
      toast.error("Image must be under 4 MB");
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
        flavor, weight, shape, eggless, jain, message, date, image: imageData,
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

      <section className="section bg-cream-50">
        <div className="container-x grid gap-8 lg:grid-cols-[1fr_380px]">
          <motion.div initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="space-y-8">
            {/* Flavor */}
            <div className="card p-6">
              <h3 className="font-display text-xl uppercase">1 · Flavor</h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {FLAVORS.map((f) => (
                  <button key={f.id} type="button" onClick={() => setFlavor(f.id)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 ${
                      flavor === f.id ? "border-flame bg-flame/5 ring-2 ring-flame/30" : "border-cocoa/10 bg-white hover:border-cocoa/30"
                    }`}>
                    <span className="font-semibold">{f.label}</span>
                    <span className="text-sm text-cocoa/60">{f.price ? `+₹${f.price}` : "Included"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div className="card p-6">
              <h3 className="font-display text-xl uppercase">2 · Weight</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {WEIGHTS.map((w) => (
                  <button key={w.id} type="button" onClick={() => setWeight(w.id)}
                    className={`rounded-pill px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 ${
                      weight === w.id ? "bg-flame text-white" : "bg-white border border-cocoa/10 hover:border-cocoa/30"
                    }`}>
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape */}
            <div className="card p-6">
              <h3 className="font-display text-xl uppercase">3 · Shape</h3>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {SHAPES.map((s) => (
                  <button key={s.id} type="button" onClick={() => setShape(s.id)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50 ${
                      shape === s.id ? "border-flame bg-flame/5 ring-2 ring-flame/30" : "border-cocoa/10 bg-white hover:border-cocoa/30"
                    }`}>
                    <span className="font-semibold">{s.label}</span>
                    <span className="text-sm text-cocoa/60">{s.price ? `+₹${s.price}` : "Included"}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dietary */}
            <div className="card p-6">
              <h3 className="font-display text-xl uppercase">4 · Diet</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <label className={`flex items-center gap-2 rounded-pill border px-4 py-2.5 cursor-pointer ${eggless ? "border-flame bg-flame/5" : "border-cocoa/10 bg-white"}`}>
                  <input type="checkbox" checked={eggless} onChange={(e) => setEggless(e.target.checked)} className="accent-flame" />
                  Eggless (+₹30)
                </label>
                <label className={`flex items-center gap-2 rounded-pill border px-4 py-2.5 cursor-pointer ${jain ? "border-flame bg-flame/5" : "border-cocoa/10 bg-white"}`}>
                  <input type="checkbox" checked={jain} onChange={(e) => setJain(e.target.checked)} className="accent-flame" />
                  Jain-friendly (+₹100)
                </label>
              </div>
            </div>

            {/* Message + image + date */}
            <div className="card p-6">
              <h3 className="font-display text-xl uppercase">5 · Personalize</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="label" htmlFor="cake-message">Message on cake</label>
                  <input id="cake-message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={40}
                    placeholder="e.g. Happy Birthday Riya!" className="input" />
                  <p className="mt-1 text-xs text-cocoa/50">{message.length}/40</p>
                </div>
                <div>
                  <label className="label">Delivery date</label>
                  <DatePicker value={date} onChange={setDate} min={minDate} />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Reference image (optional, +₹150 for edible print)</label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-cocoa/30 bg-cream-100 px-5 py-6 hover:border-flame">
                    <UploadCloud className="h-6 w-6 text-flame" />
                    <span className="text-sm text-cocoa/70">{imageData ? "Image uploaded — click to change" : "Click to upload (max 4 MB)"}</span>
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
                        className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-cocoa text-cream shadow-md transition hover:bg-flame focus-visible:outline focus-visible:outline-2 focus-visible:outline-flame"
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
              <h3 className="font-display text-xl uppercase">6 · Your details</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div><label className="label" htmlFor="cake-name">Name</label><input id="cake-name" required aria-required="true" value={name} onChange={(e) => setName(e.target.value)} className="input" /></div>
                <div><label className="label" htmlFor="cake-phone">Phone</label><input id="cake-phone" required aria-required="true" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="+91 ..." /></div>
              </div>
            </div>
          </motion.div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="card p-6">
              <h3 className="font-display text-xl">Your cake</h3>
              <div className="relative mt-4 aspect-square overflow-hidden rounded-2xl"><Image src="https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?auto=format&fit=crop&w=900&q=80" alt="Custom cake preview" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /></div>
              <ul className="mt-5 space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-cocoa/60">Flavor</span><span className="font-semibold">{FLAVORS.find((f) => f.id === flavor)?.label}</span></li>
                <li className="flex justify-between"><span className="text-cocoa/60">Weight</span><span className="font-semibold">{WEIGHTS.find((w) => w.id === weight)?.label}</span></li>
                <li className="flex justify-between"><span className="text-cocoa/60">Shape</span><span className="font-semibold">{SHAPES.find((s) => s.id === shape)?.label}</span></li>
                <li className="flex justify-between"><span className="text-cocoa/60">Eggless</span><span className="font-semibold">{eggless ? "Yes" : "No"}</span></li>
                <li className="flex justify-between"><span className="text-cocoa/60">Jain</span><span className="font-semibold">{jain ? "Yes" : "No"}</span></li>
                {message && <li className="flex justify-between"><span className="text-cocoa/60">Message</span><span className="font-semibold truncate max-w-[60%]">"{message}"</span></li>}
                {date && <li className="flex justify-between"><span className="text-cocoa/60">Delivery</span><span className="font-semibold">{date}</span></li>}
              </ul>
              <div className="mt-5 flex items-baseline justify-between border-t border-cocoa/10 pt-4">
                <span className="font-display text-xl uppercase">Total</span>
                <span className="font-display text-3xl text-flame">₹{price}</span>
              </div>
              <button onClick={() => submit(true)} disabled={submitting} className="btn-primary mt-5 w-full justify-center">
                {submitting ? "Submitting..." : "Add to Cart"}
              </button>
              <button onClick={() => submit(false)} disabled={submitting} className="btn-ghost mt-2 w-full justify-center">
                Just send a quote request
              </button>
              <p className="mt-3 text-xs text-cocoa/50">We'll call you within 2 hours to confirm details and finalize design.</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export default function CustomCakePage() {
  return (
    <Suspense
      fallback={
        <section className="bg-peach-100 py-24">
          <div className="container-x text-center text-cocoa/60">Loading the cake studio…</div>
        </section>
      }
    >
      <CustomCakeContent />
    </Suspense>
  );
}
