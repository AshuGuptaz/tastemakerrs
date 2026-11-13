import { FAQS } from "@/lib/faqs";
import { SITE_URL } from "@/lib/site";

/** Bakery LocalBusiness + FAQPage JSON-LD for the homepage. Only facts already public on the site. */
export function homeJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Bakery",
      name: "The Taste Makerrs",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon-512.png`,
      image: `${SITE_URL}/hero-cake-poster.jpg`,
      description: "Fresh-baked, eggless-on-request cakes, muffins, cookies and hampers delivered same-day across Lucknow.",
      telephone: "+917905717007",
      email: "tastemakerrs@gmail.com",
      servesCuisine: "Bakery",
      areaServed: { "@type": "City", name: "Lucknow" },
      address: { "@type": "PostalAddress", addressLocality: "Lucknow", addressCountry: "IN" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
}
