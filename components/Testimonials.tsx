"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Underlined from "./Underlined";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const REVIEWS = [
  {
    name: "Anya, mom of the birthday girl",
    quote:
      "I ordered a bento cake for my daughter's birthday and couldn't believe the joy it brought. The design was stunning — her favourite colours and even a custom message. But the best part? It tasted even better than it looked.",
  },
  {
    name: "Eva & Martin",
    quote:
      "We picked The Taste Makerrs for our wedding cake and got so many compliments. Eggless, but you'd never know — moist, balanced, beautifully finished.",
  },
  {
    name: "Larry",
    quote:
      "Sent the festive hamper to my parents in another city. Arrived perfect, packaging on point, and they couldn't stop talking about it.",
  },
];

export default function Testimonials() {
  return (
    <section className="section bg-sky-100">
      <div className="container-x">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="h-section"
        >
          Loved by <Underlined>thousands</Underlined> of sweet tooths
        </motion.h2>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <motion.figure
              key={r.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.08 }}
              className="card flex flex-col p-7"
            >
              <span aria-hidden className="font-display text-6xl leading-[0.6] text-flame/25">&ldquo;</span>
              <div className="mt-4 flex gap-0.5 text-flame">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-flame" />
                ))}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-cocoa/80">{r.quote}</p>
              <figcaption className="mt-6 font-display text-base font-medium text-cocoa">
                {r.name}
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
