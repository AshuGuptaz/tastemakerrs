import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import Stats from "@/components/home/Stats";
import Bento from "@/components/home/Bento";
import Occasions from "@/components/home/Occasions";
import Showcase from "@/components/home/Showcase";
import Packages from "@/components/home/Packages";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Stats />
      <Bento />
      <Occasions />
      <Showcase />
      <Packages />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
