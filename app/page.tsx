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
      <TrustStrip />
      <Stats />
      <Bento />
      <SignatureGallery />
      <Occasions />
      <Showcase />
      <Packages />
      <LovedBy />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
