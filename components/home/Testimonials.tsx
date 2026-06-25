import { Star } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

const REVIEWS = [
  {
    name: "Anya",
    role: "Mom of the birthday girl",
    quote:
      "Ordered a bento cake for my daughter and couldn't believe the joy it brought — her favourite colours, a custom message, and it tasted even better than it looked.",
  },
  {
    name: "Eva & Martin",
    role: "Wedding order",
    quote:
      "We picked The Taste Makerrs for our wedding cake and got endless compliments. Eggless, but you'd never know — moist, balanced, beautifully finished.",
  },
  {
    name: "Larry",
    role: "Festive hamper",
    quote:
      "Sent the hamper to my parents in another city. Arrived perfect, packaging on point, and they couldn't stop talking about it.",
  },
];

export default function Testimonials() {
  return (
    <section className="section">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="t-eyebrow justify-center">Loved by thousands</span>
          <h2 className="t-h2 mt-4">A little sweetness, a lot of love.</h2>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.08}>
              <figure className="surface surface-hover flex h-full flex-col p-7">
                <div className="flex gap-0.5 text-flame">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-flame" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[0.975rem] leading-relaxed text-ink-soft">
                  &ldquo;{r.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-flame/10 font-semibold text-flame">
                    {r.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{r.name}</span>
                    <span className="block text-xs text-ink-mut">{r.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
