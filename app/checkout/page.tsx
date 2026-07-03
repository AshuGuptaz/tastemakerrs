"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { CreditCard, Globe, MapPin } from "lucide-react";
import { useCart } from "@/context/CartContext";
import OtpDialog from "@/components/checkout/OtpDialog";
import { formatINR } from "@/lib/format";

type Address = {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
};

const EMPTY: Address = { name: "", email: "", phone: "", street: "", city: "", state: "", pincode: "", notes: "" };

// Friendly labels for validation toasts (never expose raw object keys)
const LABELS: Record<keyof Address, string> = {
  name: "full name",
  email: "email",
  phone: "phone",
  street: "street address",
  city: "city",
  state: "state",
  pincode: "pincode",
  notes: "notes",
};

// Pure helper — rupee discount for a coupon at a given subtotal
function couponValue(code: string, subtotal: number): number {
  const map: Record<string, number> = {
    FIRSTBITE: Math.round(subtotal * 0.10),
    BDAY150: subtotal >= 999 ? 150 : 0,
    HAMPER20: Math.round(subtotal * 0.20),
    BULK10: subtotal >= 3000 ? Math.round(subtotal * 0.10) : 0,
  };
  return map[code] || 0;
}

export default function CheckoutPage() {
  const { items, subtotal, clear, hydrated } = useCart();
  const [addr, setAddr] = useState<Address>(EMPTY);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [method, setMethod] = useState<"razorpay" | "stripe">("razorpay");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [errorField, setErrorField] = useState<keyof Address | null>(null);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const router = useRouter();

  const delivery = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 79;
  // Derive discount reactively from the applied coupon code so it always tracks the current cart
  const discount = couponValue(appliedCoupon, subtotal);
  const total = Math.max(0, subtotal + delivery - discount);

  useEffect(() => {
    if (hydrated && items.length === 0) router.replace("/cart");
  }, [hydrated, items.length, router]);

  // Load Razorpay script once (dedup: StrictMode double-runs + remounts must not re-inject)
  useEffect(() => {
    if ((window as any).Razorpay) { setRazorpayReady(true); return; }
    const existing = document.querySelector<HTMLScriptElement>("script[data-razorpay]");
    if (existing) { existing.addEventListener("load", () => setRazorpayReady(true)); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "1";
    script.onload = () => setRazorpayReady(true);
    document.body.appendChild(script);
    // Keep the single tag mounted for the app's lifetime — no remove() race.
  }, []);

  // Load Google Maps + Places Autocomplete once (deduped, never removed)
  useEffect(() => {
    const clearListeners = () => {
      if (autocompleteRef.current && (window as any).google) {
        (window as any).google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
    // Without a key the script 4xxs and spams the console; degrade to a plain
    // address field instead of injecting a broken tag.
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) return;
    if ((window as any).google?.maps?.places) { initAutocomplete(); return clearListeners; }
    const existing = document.querySelector<HTMLScriptElement>("script[data-gmaps]");
    if (existing) { existing.addEventListener("load", initAutocomplete); return clearListeners; }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.dataset.gmaps = "1";
    script.onload = initAutocomplete;
    document.body.appendChild(script);
    return clearListeners; // only detach listeners; never remove the shared tag
  }, []);

  // Init map when coords change
  useEffect(() => {
    if (!mapCoords || !mapRef.current || !(window as any).google) return;
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new (window as any).google.maps.Map(mapRef.current, {
        center: mapCoords,
        zoom: 15,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { elementType: "geometry", stylers: [{ color: "#FBF1E4" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#0B0B0C" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#FDE3C8" }] },
        ],
      });
    } else {
      mapInstanceRef.current.setCenter(mapCoords);
    }

    if (markerRef.current) markerRef.current.setMap(null);
    markerRef.current = new (window as any).google.maps.Marker({
      position: mapCoords,
      map: mapInstanceRef.current,
      icon: {
        path: (window as any).google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#F97316",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
    });
  }, [mapCoords]);

  function initAutocomplete() {
    if (!streetRef.current) return;
    const autocomplete = new (window as any).google.maps.places.Autocomplete(streetRef.current, {
      componentRestrictions: { country: "in" },
      fields: ["address_components", "geometry", "formatted_address"],
    });
    autocompleteRef.current = autocomplete;

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry) return;

      const components = place.address_components || [];
      const get = (type: string) =>
        components.find((c: any) => c.types.includes(type))?.long_name || "";
      const getShort = (type: string) =>
        components.find((c: any) => c.types.includes(type))?.short_name || "";

      const street = place.formatted_address || "";
      const city = get("locality") || get("administrative_area_level_2");
      const state = get("administrative_area_level_1");
      const pincode = get("postal_code");

      // street field is controlled now — React renders the value from state
      setAddr((prev) => ({ ...prev, street, city, state, pincode }));
      setMapCoords({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    });
  }

  const applyCoupon = () => {
    const c = coupon.trim().toUpperCase();
    const value = couponValue(c, subtotal);
    if (value > 0) {
      setAppliedCoupon(c);
      toast.success(`Applied ${c} · saved ${formatINR(value)}`);
    } else {
      setAppliedCoupon("");
      toast.error("Coupon not valid for this cart");
    }
  };

  const validate = () => {
    const required: (keyof Address)[] = ["name", "email", "phone", "street", "city", "state", "pincode"];
    for (const r of required) {
      if (!addr[r]) { setErrorField(r); toast.error(`Please fill ${LABELS[r]}`); return false; }
    }
    if (!/^[6-9]\d{9}$/.test(addr.phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return false;
    }
    return true;
  };

  // Step 1: validate, then require OTP verification before payment.
  const placeOrder = () => {
    if (!validate()) return;
    setShowOtp(true);
  };

  // Step 2 (after verification or when OTP is disabled): create order + pay.
  const createOrderAndPay = async () => {
    // Re-entry guard: OTP onVerified/onSkip + a stray Pay tap could otherwise
    // fire this twice and create two orders. `loading` state is async, so use a ref.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, name: i.name, price: i.price, qty: i.qty, variant: i.variant, custom: i.custom })),
          address: addr, subtotal, delivery, discount, total,
          coupon: appliedCoupon || null, paymentMethod: method,
        }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || "Order creation failed");

      if (method === "razorpay") {
        if (!razorpayReady) throw new Error("Payment is loading, please wait and try again.");

        const rpRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total, orderId: order.id }),
        });
        const rp = await rpRes.json();
        if (!rpRes.ok || !rp.id) throw new Error(rp.error || "Razorpay order failed");

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rp.amount, currency: rp.currency,
          name: "The Taste Makerrs",
          description: `Order ${order.id}`,
          order_id: rp.id,
          prefill: { name: addr.name, email: addr.email, contact: addr.phone },
          theme: { color: "#F97316" },
          handler: async (resp: any) => {
            try {
              const verify = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...resp, orderId: order.id }),
              }).then((r) => r.json());
              if (verify.ok) { clear(); router.push(`/order-success?id=${order.id}`); }
              else toast.error("Payment verification failed. Contact us if amount was deducted.");
            } catch { toast.error("Verification error. Please contact support."); }
          },
          modal: { ondismiss: () => { toast("Payment cancelled"); setLoading(false); } },
        };
        // @ts-ignore
        const r = new window.Razorpay(options);
        r.on("payment.failed", (resp: any) => {
          toast.error(resp?.error?.description || "Payment failed. Please try again.");
          setLoading(false);
        });
        r.open();
        return;
      } else {
        const s = await fetch("/api/stripe/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total, orderId: order.id, items, address: addr }),
        }).then((r) => r.json());
        if (s.url) window.location.href = s.url;
        else throw new Error(s.error || "Stripe checkout failed");
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  if (!hydrated) {
    return (
      <section className="bg-transparent py-16 md:py-24">
        <div className="container-x">
          <div className="skeleton h-14 w-56 rounded-xl" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="skeleton h-[28rem] rounded-[1.5rem]" />
            <div className="skeleton h-80 rounded-[1.5rem]" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-transparent py-16 md:py-24">
      <div className="container-x">
        <h1 className="t-display">Checkout</h1>

        <div className="mt-8 grid gap-8 pb-28 lg:grid-cols-[1fr_380px] lg:pb-0">
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="t-h3">Delivery details</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div><label className="label" htmlFor="checkout-name">Full name</label><input id="checkout-name" required aria-required="true" aria-invalid={errorField === "name"} className={`input ${errorField === "name" ? "ring-2 ring-flame/50" : ""}`} value={addr.name} onChange={(e) => { setErrorField(null); setAddr({ ...addr, name: e.target.value }); }} /></div>
                <div><label className="label" htmlFor="checkout-email">Email</label><input id="checkout-email" type="email" required aria-required="true" aria-invalid={errorField === "email"} className={`input ${errorField === "email" ? "ring-2 ring-flame/50" : ""}`} value={addr.email} onChange={(e) => { setErrorField(null); setAddr({ ...addr, email: e.target.value }); }} /></div>
                <div><label className="label" htmlFor="checkout-phone">Phone</label><input id="checkout-phone" required aria-required="true" aria-invalid={errorField === "phone"} className={`input ${errorField === "phone" ? "ring-2 ring-flame/50" : ""}`} value={addr.phone} onChange={(e) => { setErrorField(null); setAddr({ ...addr, phone: e.target.value }); }} /></div>
                <div><label className="label" htmlFor="checkout-pincode">Pincode</label><input id="checkout-pincode" required aria-required="true" aria-invalid={errorField === "pincode"} className={`input ${errorField === "pincode" ? "ring-2 ring-flame/50" : ""}`} value={addr.pincode} onChange={(e) => { setErrorField(null); setAddr({ ...addr, pincode: e.target.value }); }} /></div>
                <div className="md:col-span-2">
                  <label className="label" htmlFor="checkout-street">Street address</label>
                  <input
                    id="checkout-street"
                    ref={streetRef}
                    required
                    aria-required="true"
                    aria-invalid={errorField === "street"}
                    className={`input ${errorField === "street" ? "ring-2 ring-flame/50" : ""}`}
                    value={addr.street}
                    onChange={(e) => { setErrorField(null); setAddr((prev) => ({ ...prev, street: e.target.value })); }}
                    placeholder="Start typing your address…"
                  />
                </div>
                <div><label className="label" htmlFor="checkout-city">City</label><input id="checkout-city" required aria-required="true" aria-invalid={errorField === "city"} className={`input ${errorField === "city" ? "ring-2 ring-flame/50" : ""}`} value={addr.city} onChange={(e) => { setErrorField(null); setAddr({ ...addr, city: e.target.value }); }} /></div>
                <div><label className="label" htmlFor="checkout-state">State</label><input id="checkout-state" required aria-required="true" aria-invalid={errorField === "state"} className={`input ${errorField === "state" ? "ring-2 ring-flame/50" : ""}`} value={addr.state} onChange={(e) => { setErrorField(null); setAddr({ ...addr, state: e.target.value }); }} /></div>
                <div className="md:col-span-2"><label className="label" htmlFor="checkout-notes">Delivery notes</label><textarea id="checkout-notes" rows={3} className="input" value={addr.notes} onChange={(e) => setAddr({ ...addr, notes: e.target.value })} /></div>
              </div>

              {/* Map preview */}
              {mapCoords ? (
                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
                    <MapPin className="h-4 w-4 text-flame" /> Delivery location
                  </div>
                  <div ref={mapRef} className="h-56 w-full rounded-2xl overflow-hidden border border-line shadow-card" />
                </div>
              ) : (
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-line bg-surface/40 px-4 py-4 text-sm text-ink-mut">
                  <MapPin className="h-5 w-5 text-flame shrink-0" />
                  Start typing your street address above to see your delivery location on the map.
                </div>
              )}
            </div>

            <div className="card p-6">
              <h3 className="t-h3">Payment method</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                  { id: "razorpay", label: "Razorpay (UPI, cards, netbanking)", Icon: CreditCard, desc: "Recommended for India" },
                  { id: "stripe", label: "Stripe (international cards)", Icon: Globe, desc: "For overseas customers" },
                ].map((m) => (
                  <button key={m.id} type="button" onClick={() => setMethod(m.id as any)}
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${method === m.id ? "border-flame bg-flame/5 ring-2 ring-flame/30" : "border-line bg-white"}`}>
                    <m.Icon className="h-6 w-6 text-flame" />
                    <div>
                      <div className="font-semibold">{m.label}</div>
                      <div className="text-xs text-ink-mut">{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 self-start">
            <div className="card p-6">
              <h3 className="t-h3">Your order</h3>
              <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-2">
                {items.map((it) => (
                  <li key={it.id + (it.variant ?? "")} className="flex items-center gap-3 text-sm">
                    <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-surface text-xl">
                      {it.image && (it.image.startsWith("/") || it.image.startsWith("http")) ? (
                        <Image src={it.image} alt={it.name} fill sizes="40px" className="object-cover" />
                      ) : (
                        it.image || "🎂"
                      )}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{it.name} <span className="text-ink-mut">× {it.qty}</span></span>
                    <span className="font-semibold">{formatINR(it.qty * it.price)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex gap-2">
                <label className="sr-only" htmlFor="checkout-coupon">Coupon code</label>
                <input id="checkout-coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="input" />
                <button onClick={applyCoupon} className="btn-line shrink-0 rounded-2xl py-3">Apply</button>
              </div>

              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-ink-mut">Subtotal</span><span>{formatINR(subtotal)}</span></li>
                <li className="flex justify-between"><span className="text-ink-mut">Delivery</span><span>{delivery === 0 ? <span className="text-flame-700">FREE</span> : formatINR(delivery)}</span></li>
                {discount > 0 && <li className="flex justify-between text-flame-700"><span>Discount</span><span>−{formatINR(discount)}</span></li>}
              </ul>
              <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                <span className="t-h3">Total</span>
                <span className="font-display text-3xl text-flame-700">{formatINR(total)}</span>
              </div>
              <button onClick={placeOrder} disabled={loading} className="btn-accent mt-5 hidden w-full justify-center lg:inline-flex">
                {loading ? "Processing..." : `Pay ${formatINR(total)}`}
              </button>
              <Link href="/cart" className="mt-2 block text-center text-xs text-ink-mut hover:text-flame">← Edit cart</Link>
              <p className="mt-3 text-xs text-ink-mut">By placing the order you accept our <Link href="/privacy-policy" className="underline">privacy policy</Link>.</p>
            </div>
          </aside>
        </div>
      </div>

      {/* mobile sticky pay bar — keeps the total + Pay in reach without scrolling past the form */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-3 backdrop-blur lg:hidden">
        <div className="container-x flex items-center justify-between gap-4">
          <div className="leading-tight">
            <div className="text-[0.7rem] font-medium uppercase tracking-wide text-ink-mut">Total</div>
            <div className="font-display text-xl font-semibold text-flame-700">{formatINR(total)}</div>
          </div>
          <button onClick={placeOrder} disabled={loading} className="btn-accent flex-1 justify-center" style={{ maxWidth: "62%" }}>
            {loading ? "Processing…" : `Pay ${formatINR(total)}`}
          </button>
        </div>
      </div>

      {showOtp && (
        <OtpDialog
          email={addr.email}
          phone={addr.phone}
          name={addr.name}
          onVerified={() => { setShowOtp(false); createOrderAndPay(); }}
          onSkip={() => { setShowOtp(false); createOrderAndPay(); }}
          onClose={() => setShowOtp(false)}
        />
      )}
    </section>
  );
}
