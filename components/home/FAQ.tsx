"use client";

import { useState } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { FAQS } from "@/lib/faqs";


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
        <m.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${open ? "border-flame bg-flame text-white" : "border-line bg-surface text-ink-soft"}`}
        >
          <Plus className="h-4 w-4" />
        </m.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            key="body"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 text-[0.975rem] leading-relaxed text-ink-mut">{a}</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="section max-md:py-12">
      <div className="container-tight">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <Reveal>
            <span className="t-eyebrow">Good to know</span>
            <h2 className="t-h2 mt-4">Questions, <span className="text-gradient">answered</span>.</h2>
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
