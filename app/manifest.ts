import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Taste Makerrs",
    short_name: "Taste Makerrs",
    description: "Fresh-baked cakes, muffins, cookies and hampers delivered same-day across Lucknow.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF8F3",
    theme_color: "#B05628",
    icons: [
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
