import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

/** Dark premium CTA panel (Stripe/Linear style) with an accent gradient mesh. */
export default function CTA() {
  return (
    <section className="section">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center md:rounded-[2.5rem] md:px-12 md:py-24">
            {/* accent mesh */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-[-35%] h-[30rem] w-[34rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.55),transparent_60%)] blur-2xl" />
              <div className="absolute bottom-[-45%] right-[4%] h-80 w-80 animate-float-slow rounded-full bg-[radial-gradient(circle,rgba(253,186,116,0.40),transparent_62%)] blur-2xl" />
              <div className="absolute bottom-[-30%] left-[6%] h-72 w-72 animate-float rounded-full bg-[radial-gradient(circle,rgba(234,88,12,0.34),transparent_64%)] blur-2xl" />
              <div className="absolute inset-0 bg-grid opacity-[0.07]" />
            </div>

            <div className="relative z-10">
              <span className="gradient-ring inline-flex items-center gap-2.5 rounded-pill bg-white/[0.07] px-4 py-[0.45rem] text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
                <span className="h-[5px] w-[5px] rounded-full bg-flame-400 shadow-[0_0_6px_2px_rgba(249,115,22,0.7)]" />
                Let&apos;s make plans
              </span>
              <h2 className="font-display mx-auto mt-6 max-w-3xl text-[clamp(2.1rem,4.5vw,3.6rem)] font-semibold leading-[1.05] tracking-tighter2 text-white text-balance">
                Your next celebration deserves a cake worth remembering.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65">
                Order in minutes or design something entirely your own. Same-day delivery, baked fresh this morning.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link href="/menu" className="btn-accent group">
                  Order your cake
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-pill border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  Talk to us
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
