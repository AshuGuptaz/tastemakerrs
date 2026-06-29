"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Suspense, useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import Underlined from "@/components/Underlined";

function OrderSuccessInner() {
  const sp = useSearchParams();
  const id = sp.get("id");
  const { clear } = useCart();
  const cleared = useRef(false);
  const reduce = useReducedMotion();

  // Clear the cart once an order is confirmed. The Razorpay flow clears in its
  // success handler; the Stripe redirect does not, so this covers that path too.
  useEffect(() => {
    if (id && !cleared.current) {
      cleared.current = true;
      clear();
    }
  }, [id, clear]);

  // No order id → don't fake a confirmation (and don't clear the cart).
  if (!id) {
    return (
      <section className="bg-transparent py-20 md:py-32 min-h-[70vh]">
        <div className="container-x max-w-xl text-center">
          <h1 className="t-h2">We couldn&apos;t find that order</h1>
          <p className="mt-4 text-ink-soft">
            This page opens after a successful payment. If you were charged but landed here, your cart is safe — reach out and we&apos;ll sort it instantly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/cart" className="btn-accent">Back to cart</Link>
            <Link href="/contact" className="btn-line">Contact support</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-transparent py-20 md:py-32 min-h-[70vh]">
      <div className="container-x text-center">
        <motion.div initial={{ scale: reduce ? 1 : 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 22, mass: 0.9 }} className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-flame text-white">
          <CheckCircle2 className="h-14 w-14" />
        </motion.div>
        <h1 className="t-display mt-6">Order <Underlined>confirmed</Underlined></h1>
        <p className="mt-4 max-w-xl mx-auto text-ink-soft">
          Thank you for ordering from The Taste Makerrs. Our kitchen has started baking. We&apos;ll send you delivery updates on WhatsApp &amp; email.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-pill border border-line bg-surface px-4 py-2 text-sm">Order ref <b className="tracking-wide text-ink">#{id.slice(-8).toUpperCase()}</b></p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/menu" className="btn-accent">Order more</Link>
          <Link href="/" className="btn-line">Back to home</Link>
        </div>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <section className="bg-transparent py-20 md:py-32 min-h-[70vh]">
        <div className="container-x grid place-items-center text-center">
          <div className="skeleton h-24 w-24 rounded-full" />
          <div className="skeleton mt-6 h-12 w-72 max-w-full rounded-xl" />
          <div className="skeleton mt-4 h-4 w-96 max-w-full rounded" />
        </div>
      </section>
    }>
      <OrderSuccessInner />
    </Suspense>
  );
}
