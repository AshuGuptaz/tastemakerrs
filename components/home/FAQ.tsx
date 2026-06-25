"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const FAQS = [
  { q: "Do you have eggless and Jain-friendly options?", a: "Yes — our kitchen is 100% pure veg. Any cake can be made eggless on request, and we offer Jain-friendly options (no onion, garlic, or root-derived ingredients) on most of the menu." },
  { q: "How much notice do you need for an order?", a: "Most cakes and treats are available for same-day delivery if ordered before noon. Custom photo cakes and large tiered cakes we recommend ordering 24–48 hours ahead so we can finish them perfectly." },
  { q: "Where do you deliver, and how is it packed?", a: "We deliver same-day across the city via temperature-controlled partners. Everything ships in insulated, sealed boxes — with ice gel packs in summer — so it arrives exactly as it left the kitchen." },
  { q: "Can I fully customise a cake?", a: "Absolutely. Pick the flavour, weight and shape, add your message, and upload a photo for an edible print — design it in minutes on the Customize page and we'll call to confirm the details." },
  { q: "What about ingredients and freshness?", a: "Premium only — Madagascar vanilla, Belgian chocolate, fresh seasonal fruit — baked fresh every morning in small batches. No pre-mixes, no preservatives, ever. Our kitchen is FSSAI-certified and audited annually." },
];

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="border-b border-line">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-5 text-left transition-colors hover:text-flame focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/30"
      >
        <span className="text-[1.0625rem] font-semibold tracking-tight text-ink">{q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${open ? "border-flame bg-flame text-white" : "border-line bg-surface text-ink-soft"}`}
        >
          <Plus className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 text-[0.975rem] leading-relaxed text-ink-mut">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section">
      <div className="container-tight">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <Reveal>
            <span className="t-eyebrow">Good to know</span>
            <h2 className="t-h2 mt-4">Questions, answered.</h2>
            <p className="t-lead mt-4">Everything you need before you order. Still curious? We&apos;re a message away.</p>
          </Reveal>
          <Reveal delay={0.06}>
            <div>
              {FAQS.map((f, i) => (
                <Item key={f.q} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
