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

  return (
    <section className="bg-surface py-20 md:py-32 min-h-[70vh]">
      <div className="container-x text-center">
        <motion.div initial={{ scale: reduce ? 1 : 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 22, mass: 0.9 }} className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-flame text-white">
          <CheckCircle2 className="h-14 w-14" />
        </motion.div>
        <h1 className="t-h2 mt-6 text-[clamp(2.5rem,7vw,5rem)]">Order <Underlined>confirmed</Underlined></h1>
        <p className="mt-4 max-w-xl mx-auto text-ink-soft">
          Thank you for ordering from The Taste Makerrs. Our kitchen has started baking. We'll send you delivery updates on WhatsApp & email.
        </p>
        {id && <p className="mt-3 inline-block rounded-pill bg-white px-4 py-2 text-sm font-mono">Order ID: <b>{id}</b></p>}
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
    <Suspense fallback={<div className="container-x py-32 text-center">Loading...</div>}>
      <OrderSuccessInner />
    </Suspense>
  );
}
