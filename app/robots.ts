import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Private/transactional routes crawlers have no business in. (robots.txt only
// stops crawling; those pages also carry `noindex` via their route layouts.)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/checkout", "/cart", "/account", "/track/", "/order-success", "/maintenance"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
