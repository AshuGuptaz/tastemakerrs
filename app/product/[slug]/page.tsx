import { notFound } from "next/navigation";
import { getBySlug, PRODUCTS } from "@/lib/products";
import { CATEGORY_META } from "@/lib/products";
import ProductDetail from "./ProductDetail";
import ProductReviews from "@/components/reviews/ProductReviews";
import { formatINR } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getBySlug(params.slug);
  if (!p) return {};
  // Only advertise a preview image when the product has a real photo (some
  // fall back to an emoji placeholder, which isn't a valid OG image).
  const hasPhoto = typeof p.image === "string" && (p.image.startsWith("/") || p.image.startsWith("http"));
  const title = `${p.name} — ${formatINR(p.price)}`;
  return {
    title,
    description: p.description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: {
      title,
      description: p.description,
      type: "website",
      ...(hasPhoto ? { images: [{ url: p.image, width: 1200, height: 630, alt: p.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description: p.description,
      ...(hasPhoto ? { images: [p.image] } : {}),
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getBySlug(params.slug);
  if (!product) notFound();
  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const abs = (u: string) => (u.startsWith("http") ? u : `${SITE_URL}${u}`);
  const hasPhoto = typeof product.image === "string" && (product.image.startsWith("/") || product.image.startsWith("http"));
  // schema.org Product + Offer → eligible for Google price/availability rich results.
  // (No aggregateRating: reviews are moderated + DB-backed, and Google penalises
  // ratings that aren't present in the visible page markup.)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: CATEGORY_META[product.category].label,
    sku: product.id,
    brand: { "@type": "Brand", name: "The Taste Makerrs" },
    ...(hasPhoto ? { image: [abs(product.image)] } : {}),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      {/* "<" escaped so product text can never close the script tag */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetail product={product} related={related} categoryLabel={CATEGORY_META[product.category].label} />
      <ProductReviews productId={product.id} productName={product.name} />
    </>
  );
}
