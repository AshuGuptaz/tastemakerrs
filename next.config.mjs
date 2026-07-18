/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Baseline hardening only — skipping CSP/Permissions-Policy here since a
  // misconfigured CSP could silently break Razorpay's checkout modal, the
  // Spline embed, or Google Maps autocomplete; those need to be scoped and
  // tested deliberately rather than added blind.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  images: {
    // Serve modern formats — typically 30–70% smaller than JPEG.
    formats: ["image/avif", "image/webp"],
    // Whitelisted in case you switch product/hero visuals to remote photos later.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
    ],
  },
};

export default nextConfig;
