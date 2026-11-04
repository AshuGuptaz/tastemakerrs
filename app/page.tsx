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
import RecentlyViewed from "@/components/RecentlyViewed";
import StickyOrderBar from "@/components/home/StickyOrderBar";

export default function HomePage() {
  return (
    <>
      <AuroraBg />
      <Hero />

      {/* Act 1 — Desire: trust signals, stats, then real cake */}
      <TrustStrip />
      {/* phones: skip — it repeats the rating strip above and adds scroll */}
      <div className="hidden md:block">
        <Stats />
      </div>
      <RecentlyViewed />
      <SignatureGallery />

      {/* Act 2 — Craft & proof (warm band) */}
      {/* phones: skip — decorative feature cards are ~1,800px of scroll */}
      <div className="band-warm hidden md:block">
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
      <StickyOrderBar />
    </>
  );
}
