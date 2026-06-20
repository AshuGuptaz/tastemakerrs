"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Underlined from "./Underlined";

type Flavor = {
  name: string;
  img: string;
  bg: string;
  notes: { label: string; pos: string }[];
};

const FLAVORS: Flavor[] = [
  { name: "Vanilla", img: "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&w=900&q=80", bg: "bg-cream-200", notes: [
    { label: "Madagascar Vanilla", pos: "top-6 left-6" },
    { label: "Vanilla Bean Paste", pos: "bottom-6 right-6" },
    { label: "Whipped Cream", pos: "top-1/2 right-8" },
  ]},
  { name: "Fresh Fruit", img: "/images/cakes/strawberry.jpg", bg: "bg-peach-200", notes: [
    { label: "Seasonal Fruit", pos: "top-6 right-10" },
    { label: "Light Sponge", pos: "top-1/3 left-6" },
    { label: "Mascarpone Cream", pos: "bottom-8 left-10" },
    { label: "Fresh Compote", pos: "bottom-1/3 right-6" },
  ]},
  { name: "Chocolate", img: "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?auto=format&fit=crop&w=900&q=80", bg: "bg-cocoa-50", notes: [
    { label: "70% Belgian", pos: "top-8 left-10" },
    { label: "Cocoa Sponge", pos: "bottom-1/3 right-6" },
    { label: "Silk Ganache", pos: "bottom-8 left-6" },
  ]},
  { name: "Red Velvet", img: "https://images.unsplash.com/photo-1564844536308-75c540dbf14e?auto=format&fit=crop&w=900&q=80", bg: "bg-peach-100", notes: [
    { label: "Buttermilk", pos: "top-8 right-8" },
    { label: "Cream Cheese Frosting", pos: "bottom-8 left-8" },
  ]},
  { name: "Custom", img: "https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?auto=format&fit=crop&w=900&q=80", bg: "bg-sky-100", notes: [
    { label: "Your photo on cake", pos: "top-8 left-8" },
    { label: "Your message", pos: "bottom-8 right-10" },
    { label: "Eggless / Jain", pos: "top-1/2 right-8" },
  ]},
];

export default function FlavorsSection() {
  const [active, setActive] = useState(1);
  const f = FLAVORS[active];
  return (
    <section className="section bg-cream-100">
      <div className="container-x">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-section"
        >
          A <Underlined>flavor</Underlined> for every craving
        </motion.h2>

        <div className="mt-10 grid gap-0 overflow-hidden rounded-xl2 border border-cocoa/10 bg-white shadow-card md:grid-cols-2">
          {/* List */}
          <ul className="divide-y divide-cocoa/10">
            {FLAVORS.map((fl, i) => (
              <li key={fl.name}>
                <button
                  onClick={() => setActive(i)}
                  className={`flex w-full items-center justify-between px-6 py-6 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50 focus-visible:ring-inset active:scale-[0.99] ${
                    active === i ? "bg-flame text-white" : "bg-white hover:bg-cream-100"
                  }`}
                >
                  <span className="font-display text-xl tracking-tight md:text-2xl">{fl.name}</span>
                  <ArrowRight className={`h-5 w-5 transition-transform ${active === i ? "translate-x-1" : ""}`} />
                </button>
              </li>
            ))}
          </ul>

          {/* Preview */}
          <motion.div
            key={f.name}
            initial={{ opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.6 }}
            className={`relative min-h-[420px] ${f.bg}`}
          >
            <Image src={f.img} alt={f.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-wine/40 via-wine/5 to-transparent" />
            {f.notes.map((n, i) => (
              <motion.span
                key={n.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 + i * 0.09 }}
                className={`absolute pill ${n.pos}`}
              >
                {n.label}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
