import AuroraBg from "@/components/home/AuroraBg";
import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/home/TrustStrip";
import Stats from "@/components/home/Stats";
import Bento from "@/components/home/Bento";
import SignatureGallery from "@/components/home/SignatureGallery";
import Occasions from "@/components/home/Occasions";
import Showcase from "@/components/home/Showcase";
import Packages from "@/components/home/Packages";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <AuroraBg />
      <Hero />

      {/* Act 1 — Desire: trust signals, stats, then real cake */}
      <TrustStrip />
      <Stats />
      <SignatureGallery />

      {/* Act 2 — Craft & proof (warm band) */}
      <div className="band-warm">
        <Bento />
      </div>

      {/* Act 3 — Occasions & bestsellers */}
      <Occasions />
      <div className="band-warm">
        <Showcase />
      </div>

      {/* Pricing — dark full-bleed break */}
      <div className="band-dark">
        <Packages />
      </div>

      {/* Act 4 — Trust & convert */}
      <div className="band-warm">
        <Testimonials />
        <FAQ />
      </div>
      <CTA />
    </>
  );
}
