"use client";

import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import Underlined from "./Underlined";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const OCCASIONS = [
  { title: "Birthday Cakes",   desc: "Sweeten every birthday with a smile-worthy bento cake.",        img: "https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?auto=format&fit=crop&w=900&q=80" },
  { title: "Weddings & Dates", desc: "From romantic moments to \u201cI do\u2019s\u201d — add a unique touch.", img: "https://images.unsplash.com/photo-1559553156-2e97137af16f?auto=format&fit=crop&w=900&q=80" },
  { title: "Other Events",     desc: "Turn any event into a celebration — promotions or BFF dates.",     img: "https://images.unsplash.com/photo-1687795097254-f019f9d7fd17?auto=format&fit=crop&w=900&q=80" },
];

export default function OccasionsStrip() {
  return (
    <section className="section bg-sky-100">
      <div className="container-x">
        <m.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="h-section text-center"
        >
          Every occasion deserves a <Underlined>yummy</Underlined> cake
        </m.h2>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {OCCASIONS.map((o, i) => (
            <m.div
              key={o.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.12 }}
              className="card group overflow-hidden"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={o.img}
                  alt={o.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wine/25 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold tracking-tight">{o.title}</h3>
                <p className="mt-1 text-sm text-cocoa/70">{o.desc}</p>
                <Link href="/menu" className="mt-3 inline-flex items-center gap-1 rounded-pill text-sm font-semibold text-flame transition-all hover:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flame/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-100">
                  Shop now →
                </Link>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
