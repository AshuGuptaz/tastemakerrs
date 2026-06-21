/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            // Report-Only (NOT enforcing) so we can observe violations before
            // turning on a strict CSP. Allowlists exactly what the app loads.
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.razorpay.com https://*.spline.design",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.unsplash.com https://res.cloudinary.com https://cdn.pixabay.com https://*.spline.design",
              "connect-src 'self' https://api.stripe.com https://*.razorpay.com https://prod.spline.design https://*.spline.design https://api.cloudinary.com",
              "frame-src https://js.stripe.com https://*.razorpay.com https://checkout.razorpay.com",
              "font-src 'self' data:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
