"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { CreditCard, Globe, MapPin, Gift, CalendarDays, Clock, ChevronDown, Check } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { loadSavedContact, saveContact, clearSavedContact } from "@/lib/saved-contact";
import OtpDialog from "@/components/checkout/OtpDialog";
import { isValidPincode, isServiceablePincode } from "@/lib/delivery-area";
import { whatsappLink } from "@/lib/site";
import { track, trackBeginCheckout, stashPurchase } from "@/lib/analytics";
import DatePicker from "@/components/DatePicker";
import { formatINR } from "@/lib/format";
import { discountForRule, deliveryFee, type CouponRule } from "@/lib/pricing";
import { DELIVERY_SLOTS, isoDateOffset, formatDeliveryDate, isSlotBookable, bookableSlots, type SlotId } from "@/lib/fulfillment";

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

/**
 * Run `fn` once the page has loaded and the browser is idle — or at the customer's
 * first interaction, whichever comes first. Keeps heavy third-party scripts
 * (Razorpay ~166KB, Google Maps ~400KB) off the critical path so they can't
 * compete with the page's own JS/LCP, while still being ready long before anyone
 * can finish the form. Returns a cleanup.
 */
function afterLoadOrInteract(fn: () => void): () => void {
  let done = false;
  let idleId: number | undefined;
  const cleanups: Array<() => void> = [];
  const run = () => {
    if (done) return;
    done = true;
    cleanups.forEach((c) => c());
    fn();
  };
  const onLoad = () => {
    if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(run, { timeout: 3000 });
    else { const t = window.setTimeout(run, 1500); cleanups.push(() => clearTimeout(t)); }
  };
  if (document.readyState === "complete") onLoad();
  else { window.addEventListener("load", onLoad, { once: true }); cleanups.push(() => window.removeEventListener("load", onLoad)); }
  document.addEventListener("focusin", run, { once: true });
  document.addEventListener("pointerdown", run, { once: true });
  cleanups.push(() => { document.removeEventListener("focusin", run); document.removeEventListener("pointerdown", run); });
  return () => { done = true; cleanups.forEach((c) => c()); if (idleId !== undefined && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId); };
}

export default function CheckoutPage() {
  const { items, subtotal, clear, hydrated } = useCart();
  const { customer, loading: customerLoading } = useCustomer();
  const [addr, setAddr] = useState<Address>(EMPTY);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [coupon, setCoupon] = useState("");
  // The rule the SERVER validated (/api/coupons/validate). The discount is recomputed
  // from it with the same pure function /api/orders uses, so it tracks the subtotal.
  const [appliedRule, setAppliedRule] = useState<CouponRule | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [method, setMethod] = useState<"razorpay" | "stripe">("razorpay");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [errorField, setErrorField] = useState<keyof Address | null>(null);
  // Delivery schedule (date defaults to today; slot must be chosen)
  const [fulfillDate, setFulfillDate] = useState(isoDateOffset(0));
  const [fulfillSlot, setFulfillSlot] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  // "Now" for slot availability — null until mounted (no SSR/CSR clock mismatch), then ticks every 30s
  // so a slot disappears the moment it stops being bookable.
  const [clock, setClock] = useState<Date | null>(null);
  const dateDefaultedRef = useRef(false);
  // Gifting
  const [isGift, setIsGift] = useState(false);
  const [gift, setGift] = useState({ recipientName: "", recipientPhone: "", message: "", hidePrices: false });
  const prefilledRef = useRef(false);
  const guestPrefilledRef = useRef(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const streetRef = useRef<HTMLInputElement>(null);
  const submittingRef = useRef(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const router = useRouter();

  // Delivery + discount from the shared pricing authority (lib/pricing) — the
  // exact same code the server uses, so the display can't drift from the charge.
  const delivery = deliveryFee(subtotal);
  const discount = appliedRule ? discountForRule(appliedRule, subtotal) : 0;
  // Only send a code that actually earns something at this subtotal.
  const appliedCoupon = appliedRule && discount > 0 ? appliedRule.code : "";
  const total = Math.max(0, subtotal + delivery - discount);

  // `paidRef` is set right before a successful payment clears the cart and heads to
  // /order-success. Without it, clear() empties the cart → this effect fires
  // router.replace("/cart") and OVERRIDES the push to /order-success, so a customer
  // who just paid lands on an empty cart instead of their confirmation.
  const paidRef = useRef(false);
  useEffect(() => {
    if (hydrated && items.length === 0 && !paidRef.current) router.replace("/cart");
  }, [hydrated, items.length, router]);

  // Funnel: reached checkout with a non-empty cart (once per visit).
  const trackedCheckoutRef = useRef(false);
  useEffect(() => {
    if (!hydrated || items.length === 0 || trackedCheckoutRef.current) return;
    trackedCheckoutRef.current = true;
    trackBeginCheckout(items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, variant: i.variant })), subtotal);
  }, [hydrated, items, subtotal]);

  // Prefill contact + default address for a signed-in customer (once, and only
  // into still-empty fields so it never clobbers something they've typed).
  useEffect(() => {
    if (!customer || prefilledRef.current) return;
    prefilledRef.current = true;
    const def = customer.addresses.find((a) => a.isDefault) || customer.addresses[0];
    setAddr((prev) => ({
      ...prev,
      name: prev.name || customer.name || def?.name || "",
      email: prev.email || customer.email || "",
      phone: prev.phone || customer.phone || def?.phone || "",
      street: prev.street || def?.street || "",
      city: prev.city || def?.city || "",
      state: prev.state || def?.state || "",
      pincode: prev.pincode || def?.pincode || "",
    }));
  }, [customer]);

  // Guests: prefill from details remembered on this device (only into still-empty
  // fields, and only once we know nobody is signed in — signed-in customers get
  // their account details above instead). Pincode falls back to the one they
  // entered in the product-page delivery check.
  useEffect(() => {
    if (customerLoading || customer || guestPrefilledRef.current) return;
    guestPrefilledRef.current = true;
    const saved = loadSavedContact();
    let pin = "";
    try { pin = localStorage.getItem("ttm_pincode") || ""; } catch {}
    if (!saved && !pin) return;
    setAddr((prev) => ({
      ...prev,
      name: prev.name || saved?.name || "",
      email: prev.email || saved?.email || "",
      phone: prev.phone || saved?.phone || "",
      street: prev.street || saved?.street || "",
      city: prev.city || saved?.city || "",
      state: prev.state || saved?.state || "",
      pincode: prev.pincode || saved?.pincode || pin,
    }));
  }, [customer, customerLoading]);

  useEffect(() => {
    setClock(new Date());
    const t = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // If nothing is bookable today (past the noon cutoff), default to tomorrow instead of
  // leaving the customer on a date where every slot is greyed out. Once only — never
  // overrides a date they chose themselves.
  useEffect(() => {
    if (!clock || dateDefaultedRef.current) return;
    dateDefaultedRef.current = true;
    const today = isoDateOffset(0);
    if (fulfillDate === today && bookableSlots(today, clock).length === 0) setFulfillDate(isoDateOffset(1));
  }, [clock, fulfillDate]);

  // A previously-picked slot that has just become unbookable (clock moved / date changed) is cleared.
  useEffect(() => {
    if (clock && fulfillSlot && !isSlotBookable(fulfillDate, fulfillSlot as SlotId, clock)) setFulfillSlot("");
  }, [clock, fulfillDate, fulfillSlot]);

  const applySavedAddress = (id: string) => {
    const a = customer?.addresses.find((x) => x._id === id);
    if (!a) return;
    setErrorField(null);
    setAddr((prev) => ({
      ...prev,
      name: a.name || prev.name,
      phone: a.phone || prev.phone,
      street: a.street || "",
      city: a.city || "",
      state: a.state || "",
      pincode: a.pincode || "",
    }));
  };

  // Load Razorpay script once (dedup: StrictMode double-runs + remounts must not re-inject)
  useEffect(() => {
    if ((window as any).Razorpay) { setRazorpayReady(true); return; }
    return afterLoadOrInteract(() => {
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
    });
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
    const cancelDefer = afterLoadOrInteract(() => {
      if ((window as any).google?.maps?.places) { initAutocomplete(); return; }
      const existing = document.querySelector<HTMLScriptElement>("script[data-gmaps]");
      if (existing) { existing.addEventListener("load", initAutocomplete); return; }
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.dataset.gmaps = "1";
      script.onload = initAutocomplete;
      document.body.appendChild(script);
    });
    return () => { cancelDefer(); clearListeners(); }; // only detach listeners; never remove the shared tag
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

  const applyCoupon = async () => {
    const c = coupon.trim().toUpperCase();
    if (!c) { setAppliedRule(null); return; }
    if (couponBusy) return;
    setCouponBusy(true);
    try {
      const r = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c, subtotal, phone: addr.phone || undefined, email: addr.email || undefined }),
      }).then((res) => res.json());
      if (r.ok && r.rule) {
        setAppliedRule(r.rule);
        toast.success(`Applied ${r.rule.code} · saved ${formatINR(r.discount)}`);
      } else {
        setAppliedRule(null);
        toast.error(r.error || "Coupon not valid for this cart");
      }
    } catch {
      toast.error("Couldn't check that code right now. Please try again.");
    } finally {
      setCouponBusy(false);
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
    if (!fulfillSlot) {
      toast.error("Please choose a delivery time slot");
      return false;
    }
    if (isGift && !gift.recipientName.trim()) {
      toast.error("Please add the recipient's name for the gift");
      return false;
    }
    return true;
  };

  // Step 1: validate, then require OTP verification before payment.
  const placeOrder = () => {
    if (!validate()) return;
    track("place_order_clicked", { currency: "INR", value: total, payment_method: method });
    setShowOtp(true);
  };

  // Step 2 (after verification or when OTP is disabled): create order + pay.
  const createOrderAndPay = async () => {
    // Re-entry guard: OTP onVerified/onSkip + a stray Pay tap could otherwise
    // fire this twice and create two orders. `loading` state is async, so use a ref.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    // Deliberately not a try/finally: while the Razorpay modal is open, the
    // guard must stay engaged until one of ITS callbacks (handler/ondismiss/
    // payment.failed) fires — not the instant r.open() returns. A finally
    // here would release the guard as soon as the modal opens, letting a
    // second Pay tap create a second order and a second stacked modal while
    // the first is still live and payable. Every real exit path below calls
    // release() explicitly instead.
    const release = () => {
      setLoading(false);
      submittingRef.current = false;
    };

    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, name: i.name, price: i.price, qty: i.qty, variant: i.variant, custom: i.custom })),
          address: addr, subtotal, delivery, discount, total,
          fulfillment: { date: fulfillDate, slot: fulfillSlot },
          gift: isGift
            ? { isGift: true, recipientName: gift.recipientName, recipientPhone: gift.recipientPhone, message: gift.message, hidePrices: gift.hidePrices }
            : { isGift: false },
          coupon: appliedCoupon || null, paymentMethod: method,
        }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || "Order creation failed");

      // Reconcile against the server's authoritative total. If a catalog price
      // changed since these items were added to the cart, the amount we'd charge
      // differs from what was displayed — stop and make the customer re-confirm
      // rather than silently charging a different number.
      if (typeof order.total === "number" && Math.round(order.total) !== Math.round(total)) {
        toast.error(`Prices have changed — the total is now ${formatINR(order.total)}. Please review your cart and place the order again.`);
        release();
        return;
      }

      stashPurchase({
        id: order.id, value: total, shipping: delivery, coupon: appliedCoupon || null,
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, variant: i.variant })),
      });

      // Order exists and prices reconcile → remember (or forget) a guest's details.
      if (!customer) {
        if (rememberMe) saveContact(addr);
        else clearSavedContact();
      }

      if (method === "razorpay") {
        if (!razorpayReady) throw new Error("Payment is loading, please wait and try again.");

        const rpRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total, orderId: order.id }),
        });
        const rp = await rpRes.json();
        if (rpRes.status === 409 && rp.paid) {
          // We'd already received this payment (late confirmation) — it's confirmed, don't charge again.
          toast.success("Your payment was already received!");
          paidRef.current = true;
          clear();
          router.push(`/order-success?id=${order.id}`);
          return;
        }
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
              if (verify.ok) { paidRef.current = true; clear(); router.push(`/order-success?id=${order.id}`); }
              else { toast.error("Payment verification failed. Contact us if amount was deducted."); release(); }
            } catch { toast.error("Verification error. Please contact support."); release(); }
          },
          modal: { ondismiss: () => { track("payment_cancelled", { payment_method: "razorpay" }); toast("Payment cancelled"); release(); } },
        };
        // @ts-ignore
        const r = new window.Razorpay(options);
        r.on("payment.failed", (resp: any) => {
          track("payment_failed", { payment_method: "razorpay", reason: resp?.error?.reason || "unknown" });
          toast.error(resp?.error?.description || "Payment failed. Please try again.");
          release();
        });
        r.open();
        // No release() here — stays engaged until a Razorpay callback above fires.
        return;
      } else {
        const s = await fetch("/api/stripe/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total, orderId: order.id, items, address: addr }),
        }).then((r) => r.json());
        if (s.url) window.location.href = s.url;
        else throw new Error(s.error || "Stripe checkout failed");
        // No release() on the success path either — the page is navigating away.
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
      release();
    }
  };

  if (!hydrated) {
    return (
      // min-h approximates the real form's height so the footer doesn't jump down
      // (CLS ~0.18) when the form replaces this skeleton.
      <section className="bg-transparent py-16 md:py-24 min-h-[1900px] lg:min-h-[1050px]">
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

        <div className="mt-8 grid gap-8 pb-8 lg:grid-cols-[1fr_380px] lg:pb-0">
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="t-h3">Delivery details</h3>

              {/* Saved-address picker for signed-in customers — one tap to fill */}
              {customer && customer.addresses.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {customer.addresses.map((a) => (
                    <button
                      key={a._id}
                      type="button"
                      onClick={() => applySavedAddress(a._id)}
                      className="flex items-center gap-1.5 rounded-pill border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:border-flame hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/30"
                    >
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-flame" />
                      <span className="max-w-[140px] truncate">{a.label || "Address"}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div><label className="label" htmlFor="checkout-name">Full name</label><input id="checkout-name" required aria-required="true" aria-invalid={errorField === "name"} className={`input ${errorField === "name" ? "ring-2 ring-flame/50" : ""}`} value={addr.name} onChange={(e) => { setErrorField(null); setAddr({ ...addr, name: e.target.value }); }} /></div>
                <div><label className="label" htmlFor="checkout-email">Email</label><input id="checkout-email" type="email" required aria-required="true" aria-invalid={errorField === "email"} className={`input ${errorField === "email" ? "ring-2 ring-flame/50" : ""}`} value={addr.email} onChange={(e) => { setErrorField(null); setAddr({ ...addr, email: e.target.value }); }} /></div>
                <div><label className="label" htmlFor="checkout-phone">Phone</label><input id="checkout-phone" required aria-required="true" aria-invalid={errorField === "phone"} className={`input ${errorField === "phone" ? "ring-2 ring-flame/50" : ""}`} value={addr.phone} onChange={(e) => { setErrorField(null); setAddr({ ...addr, phone: e.target.value }); }} /></div>
                <div><label className="label" htmlFor="checkout-pincode">Pincode</label><input id="checkout-pincode" required aria-required="true" aria-invalid={errorField === "pincode"} className={`input ${errorField === "pincode" ? "ring-2 ring-flame/50" : ""}`} value={addr.pincode} onChange={(e) => { setErrorField(null); setAddr({ ...addr, pincode: e.target.value }); }} />
                  {isValidPincode(addr.pincode) && !isServiceablePincode(addr.pincode) && (
                    <p role="status" className="mt-1.5 text-xs text-flame-700">
                      {addr.pincode} is outside our usual Lucknow delivery area. You can still order — we&apos;ll confirm delivery with you on WhatsApp,{" "}
                      <a href={whatsappLink(`Hi, can you deliver to pincode ${addr.pincode}?`)} target="_blank" rel="noopener noreferrer" className="font-semibold underline">or ask us now</a>.
                    </p>
                  )}
                </div>
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
                {!customer && (
                  <label className="md:col-span-2 flex cursor-pointer items-center gap-3 text-sm text-ink-soft">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-5 w-5 accent-flame" />
                    Remember my details on this device for next time
                  </label>
                )}
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

            {/* ── Delivery schedule ─────────────────────────────────────── */}
            <div className="card p-6">
              <h3 className="t-h3 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-flame" /> When should we deliver?</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Delivery date</label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar((s) => !s)}
                    aria-expanded={showCalendar}
                    className="flex w-full items-center justify-between rounded-2xl border border-line bg-white px-4 py-3 text-left text-sm font-medium text-ink transition hover:border-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/30"
                  >
                    <span>{formatDeliveryDate(fulfillDate)}</span>
                    <ChevronDown className={`h-4 w-4 text-ink-mut transition-transform ${showCalendar ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {showCalendar && (
                      <m.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3">
                          <DatePicker
                            value={fulfillDate}
                            min={isoDateOffset(0)}
                            onChange={(d) => { setFulfillDate(d); setShowCalendar(false); }}
                          />
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
                <div>
                  <label className="label flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-flame" /> Time slot</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DELIVERY_SLOTS.map((s) => {
                      const available = !clock || isSlotBookable(fulfillDate, s.id, clock);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          disabled={!available}
                          onClick={() => setFulfillSlot(s.id)}
                          aria-pressed={fulfillSlot === s.id}
                          title={available ? undefined : "Not available for this date"}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/30 ${
                            !available
                              ? "cursor-not-allowed border-line bg-ink/[0.03] text-ink-mut/50 line-through"
                              : fulfillSlot === s.id ? "border-flame bg-flame/5 text-flame-700 ring-2 ring-flame/30" : "border-line bg-white text-ink-soft hover:border-flame/50"
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                  {clock && bookableSlots(fulfillDate, clock).length === 0 && (
                    <p className="mt-2 text-xs text-flame-700">
                      No slots are left for this date — same-day orders close at 12 noon. Please pick tomorrow or later.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Send as a gift ────────────────────────────────────────── */}
            <div className="card p-6">
              <button
                type="button"
                onClick={() => setIsGift((g) => !g)}
                aria-pressed={isGift}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="t-h3 flex items-center gap-2"><Gift className="h-5 w-5 text-flame" /> Send as a gift</span>
                <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${isGift ? "bg-flame" : "bg-line"}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${isGift ? "left-[1.4rem]" : "left-0.5"}`} />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isGift && (
                  <m.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 grid gap-4">
                      <p className="text-sm text-ink-mut">We&apos;ll pack it beautifully with your note and, if you like, keep the price off the delivery slip.</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="label" htmlFor="gift-name">Recipient&apos;s name</label>
                          <input id="gift-name" className="input" value={gift.recipientName} onChange={(e) => setGift({ ...gift, recipientName: e.target.value })} placeholder="Who's it for?" />
                        </div>
                        <div>
                          <label className="label" htmlFor="gift-phone">Recipient&apos;s phone <span className="font-normal text-ink-mut">(optional)</span></label>
                          <input id="gift-phone" className="input" value={gift.recipientPhone} onChange={(e) => setGift({ ...gift, recipientPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="For delivery coordination" />
                        </div>
                      </div>
                      <div>
                        <label className="label" htmlFor="gift-msg">Gift message</label>
                        <textarea id="gift-msg" rows={3} maxLength={500} className="input" value={gift.message} onChange={(e) => setGift({ ...gift, message: e.target.value })} placeholder="Happy birthday! Hope your day is as sweet as this cake 🎂" />
                      </div>
                      <label className="flex items-center gap-2.5 text-sm text-ink-soft">
                        <input type="checkbox" checked={gift.hidePrices} onChange={(e) => setGift({ ...gift, hidePrices: e.target.checked })} className="h-4 w-4 rounded border-line text-flame focus:ring-flame/30" />
                        Hide prices on the delivery slip
                      </label>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
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
              <ul data-lenis-prevent className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-2">
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
                <button onClick={applyCoupon} disabled={couponBusy} className="btn-line shrink-0 rounded-2xl py-3">{couponBusy ? "Checking…" : "Apply"}</button>
              </div>
              {appliedCoupon && (
                <p className="mt-2 text-xs text-flame-700">
                  <strong>{appliedCoupon}</strong> applied.{" "}
                  <button type="button" onClick={() => { setAppliedRule(null); setCoupon(""); }} className="font-semibold underline">Remove</button>
                </p>
              )}

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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-3 backdrop-blur lg:hidden">
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

      <AnimatePresence>
        {showOtp && (
          <OtpDialog
            email={addr.email}
            phone={addr.phone}
            name={addr.name}
            onVerified={() => { track("otp_verified"); setShowOtp(false); createOrderAndPay(); }}
            onSkip={() => { setShowOtp(false); createOrderAndPay(); }}
            onClose={() => setShowOtp(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
