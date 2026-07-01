import AuroraBg from "@/components/home/AuroraBg";
import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/home/TrustStrip";
import Stats from "@/components/home/Stats";
import Bento from "@/components/home/Bento";
import SignatureGallery from "@/components/home/SignatureGallery";
import Occasions from "@/components/home/Occasions";
import Showcase from "@/components/home/Showcase";
import Packages from "@/components/home/Packages";
import LovedBy from "@/components/home/LovedBy";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <AuroraBg />
      <Hero />

      {/* Act 1 — Desire: trust, then real cake immediately */}
      <TrustStrip />
      <SignatureGallery />

      {/* Act 2 — Craft & proof (warm band) */}
      <div className="band-warm">
        <Bento />
        <Stats />
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
      <LovedBy />
      <div className="band-warm">
        <Testimonials />
        <FAQ />
      </div>
      <CTA />
    </>
  );
}
