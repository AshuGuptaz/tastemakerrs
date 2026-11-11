import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { SITE_URL } from "@/lib/site";

// Public, indexable pages only — product URLs come from the same catalog that
// generateStaticParams uses, so the sitemap can never list a 404.
const STATIC: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }> = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/menu", priority: 0.9, changeFrequency: "daily" },
  { path: "/custom-cake", priority: 0.8, changeFrequency: "monthly" },
  { path: "/offers", priority: 0.7, changeFrequency: "weekly" },
  { path: "/kitchen", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/delivery-policy", priority: 0.3, changeFrequency: "monthly" },
  { path: "/privacy-policy", priority: 0.2, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    ...STATIC.map((s) => ({ url: `${SITE_URL}${s.path}`, lastModified: now, changeFrequency: s.changeFrequency, priority: s.priority })),
    ...PRODUCTS.map((p) => ({ url: `${SITE_URL}/product/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
