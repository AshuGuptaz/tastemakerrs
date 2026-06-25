import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import Bento from "@/components/home/Bento";
import Showcase from "@/components/home/Showcase";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Bento />
      <Showcase />
      <Testimonials />
      <CTA />
    </>
  );
}
