import { notFound } from "next/navigation";
import { getBySlug, PRODUCTS } from "@/lib/products";
import { CATEGORY_META } from "@/lib/products";
import ProductDetail from "./ProductDetail";

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getBySlug(params.slug);
  if (!p) return {};
  return {
    title: `${p.name} — ₹${p.price}`,
    description: p.description,
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
