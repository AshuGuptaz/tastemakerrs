import Hero from "@/components/Hero";
import MarqueeStrip from "@/components/MarqueeStrip";
import OccasionsStrip from "@/components/OccasionsStrip";
import FeaturedProducts from "@/components/FeaturedProducts";
import FlavorsSection from "@/components/FlavorsSection";
import StickyStory from "@/components/StickyStory";
import Testimonials from "@/components/Testimonials";
import BentoBanner from "@/components/BentoBanner";
import CTABanner from "@/components/CTABanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <OccasionsStrip />
      <FeaturedProducts />
      <FlavorsSection />
      <StickyStory />
      <Testimonials />
      <BentoBanner />
      <CTABanner />
    </>
  );
}
