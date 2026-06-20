"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import toast from "react-hot-toast";
import { CreditCard, Globe } from "lucide-react";
import { useCart } from "@/context/CartContext";

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

export default function CheckoutPage() {
  const { items, subtotal, clear, hydrated } = useCart();
  const [addr, setAddr] = useState<Address>(EMPTY);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [method, setMethod] = useState<"razorpay" | "stripe">("razorpay");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const delivery = subtotal === 0 ? 0 : subtotal >= 999 ? 0 : 79;
  const total = Math.max(0, subtotal + delivery - discount);

  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  const applyCoupon = () => {
    const c = coupon.trim().toUpperCase();
    const map: Record<string, number> = {
      FIRSTBITE: Math.round(subtotal * 0.10),
      BDAY150: subtotal >= 999 ? 150 : 0,
      HAMPER20: Math.round(subtotal * 0.20),
      BULK10: subtotal >= 3000 ? Math.round(subtotal * 0.10) : 0,
    };
    if (map[c] && map[c] > 0) {
      setDiscount(map[c]);
      toast.success(`Applied ${c} · saved ₹${map[c]}`);
    } else {
      setDiscount(0);
      toast.error("Coupon not valid for this cart");
    }
  };

  const validate = () => {
    const required: (keyof Address)[] = ["name", "email", "phone", "street", "city", "state", "pincode"];
    for (const r of required) {
      if (!addr[r]) {
        toast.error(`Please fill ${r}`);
        return false;
      }
    }
    if (!/^[6-9]\d{9}$/.test(addr.phone)) {
      toast.error("Enter a valid 10-digit Indian mobile number");
      return false;
    }
    return true;
  };

  const placeOrder = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // 1. Create order in our DB
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, name: i.name, price: i.price, qty: i.qty, custom: i.custom })),
          address: addr,
          subtotal, delivery, discount, total,
          coupon: coupon || null,
          paymentMethod: method,
        }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || "Order creation failed");

      if (method === "razorpay") {
        // 2a. Razorpay flow
        // @ts-ignore
        if (!window.Razorpay) {
          throw new Error("Payment script not loaded. Please refresh the page and try again.");
        }

        const rpRes = await fetch("/api/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total, orderId: order.id }),
        });
        const rp = await rpRes.json();

        if (!rpRes.ok || !rp.id) throw new Error(rp.error || "Razorpay order failed");

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rp.amount,
          currency: rp.currency,
          name: "The Taste Makerrs",
          description: `Order ${order.id}`,
          order_id: rp.id,
          prefill: { name: addr.name, email: addr.email, contact: addr.phone },
          theme: { color: "#F26A8D" },
          handler: async (resp: any) => {
            try {
              const verify = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...resp, orderId: order.id }),
              }).then((r) => r.json());
              if (verify.ok) {
                clear();
                router.push(`/order-success?id=${order.id}`);
              } else {
                toast.error("Payment verification failed. Contact us if amount was deducted.");
              }
            } catch {
              toast.error("Verification error. Please contact support.");
            }
          },
          modal: { ondismiss: () => { toast("Payment cancelled"); setLoading(false); } },
        };
        // @ts-ignore Razorpay added by external script
        const r = new window.Razorpay(options);
        r.open();
        return;
      } else {
        // 2b. Stripe Checkout flow
        const s = await fetch("/api/stripe/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total, orderId: order.id, items, address: addr }),
        }).then((r) => r.json());
        if (s.url) {
          window.location.href = s.url;
        } else {
          throw new Error(s.error || "Stripe checkout failed");
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      <section className="bg-cream-50 py-16 md:py-24">
        <div className="container-x">
          <h1 className="display text-[clamp(2.5rem,7vw,5rem)]">CHECKOUT.</h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="font-display text-xl uppercase">Delivery details</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div><label className="label">Full name</label><input className="input" value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} /></div>
                  <div><label className="label">Email</label><input type="email" className="input" value={addr.email} onChange={(e) => setAddr({ ...addr, email: e.target.value })} /></div>
                  <div><label className="label">Phone</label><input className="input" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} /></div>
                  <div><label className="label">Pincode</label><input className="input" value={addr.pincode} onChange={(e) => setAddr({ ...addr, pincode: e.target.value })} /></div>
                  <div className="md:col-span-2"><label className="label">Street address</label><input className="input" value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} /></div>
                  <div><label className="label">City</label><input className="input" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} /></div>
                  <div><label className="label">State</label><input className="input" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} /></div>
                  <div className="md:col-span-2"><label className="label">Delivery notes</label><textarea rows={3} className="input" value={addr.notes} onChange={(e) => setAddr({ ...addr, notes: e.target.value })} /></div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-display text-xl uppercase">Payment method</h3>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {[
                    { id: "razorpay", label: "Razorpay (UPI, cards, netbanking)", Icon: CreditCard, desc: "Recommended for India" },
                    { id: "stripe",   label: "Stripe (international cards)",     Icon: Globe, desc: "For overseas customers" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id as any)}
                      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                        method === m.id ? "border-flame bg-flame/5 ring-2 ring-flame/30" : "border-cocoa/10 bg-white"
                      }`}
                    >
                      <m.Icon className="h-6 w-6 text-flame" />
                      <div>
                        <div className="font-semibold">{m.label}</div>
                        <div className="text-xs text-cocoa/60">{m.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 self-start">
              <div className="card p-6">
                <h3 className="font-display text-xl uppercase">Your order</h3>
                <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-2">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 text-sm">
                      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-cream-100 text-xl">
                        {it.image && (it.image.startsWith("/") || it.image.startsWith("http")) ? (
                          <Image src={it.image} alt={it.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          it.image || "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&w=900&q=80"
                        )}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{it.name} <span className="text-cocoa/50">× {it.qty}</span></span>
                      <span className="font-semibold">₹{it.qty * it.price}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex gap-2">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="input" />
                  <button onClick={applyCoupon} className="btn-ghost shrink-0">Apply</button>
                </div>

                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex justify-between"><span className="text-cocoa/60">Subtotal</span><span>₹{subtotal}</span></li>
                  <li className="flex justify-between"><span className="text-cocoa/60">Delivery</span><span>{delivery === 0 ? <span className="text-flame">FREE</span> : `₹${delivery}`}</span></li>
                  {discount > 0 && <li className="flex justify-between text-flame"><span>Discount</span><span>− ₹{discount}</span></li>}
                </ul>
                <div className="mt-3 flex items-baseline justify-between border-t border-cocoa/10 pt-3">
                  <span className="font-display text-xl uppercase">Total</span>
                  <span className="font-display text-3xl text-flame">₹{total}</span>
                </div>
                <button onClick={placeOrder} disabled={loading} className="btn-primary mt-5 w-full justify-center">
                  {loading ? "Processing..." : `Pay ₹${total}`}
                </button>
                <Link href="/cart" className="mt-2 block text-center text-xs text-cocoa/60 hover:text-flame">← Edit cart</Link>
                <p className="mt-3 text-xs text-cocoa/50">By placing the order you accept our <Link href="/privacy-policy" className="underline">privacy policy</Link>.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
