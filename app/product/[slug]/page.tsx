import { notFound } from "next/navigation";
import { getBySlug, PRODUCTS } from "@/lib/products";
import { CATEGORY_META } from "@/lib/products";
import ProductDetail from "./ProductDetail";
import { formatINR } from "@/lib/format";

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

  return (
    <ProductDetail product={product} related={related} categoryLabel={CATEGORY_META[product.category].label} />
  );
}
