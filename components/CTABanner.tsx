import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/ui/Reveal";

/**
 * Dark premium CTA panel used at the bottom of inner pages — mirrors the home
 * CTA so the whole site shares the same dark, orange-glow "make plans" moment.
 */
export default function CTABanner() {
  return (
    <section className="section">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center md:rounded-[2.5rem] md:px-12 md:py-24">
            {/* orange glow mesh */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-[-35%] h-[30rem] w-[34rem] -translate-x-1/2 animate-aurora rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.55),transparent_60%)] blur-2xl" />
              <div className="absolute bottom-[-45%] right-[4%] h-80 w-80 animate-float-slow rounded-full bg-[radial-gradient(circle,rgba(253,186,116,0.40),transparent_62%)] blur-2xl" />
              <div className="absolute bottom-[-30%] left-[6%] h-72 w-72 animate-float rounded-full bg-[radial-gradient(circle,rgba(234,88,12,0.34),transparent_64%)] blur-2xl" />
              <div className="absolute inset-0 bg-grid opacity-[0.07]" />
            </div>

            <div className="relative z-10">
              <span className="chip border-white/15 bg-white/10 text-white/90">Let&apos;s make plans</span>
              <h2 className="font-display mx-auto mt-6 max-w-3xl text-balance text-[clamp(2.1rem,4.5vw,3.6rem)] font-semibold leading-[1.05] tracking-tighter2 text-white">
                Let&apos;s make something sweet together.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/65">
                Order a cake in minutes or tell us about your event — same-day delivery, baked fresh this morning.
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
