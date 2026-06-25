import type { Config } from "tailwindcss";

/**
 * Design tokens.
 *
 * REDESIGN (premium light-neutral + warm accent):
 *   ink / canvas / surface / line  → the new neutral system (Linear/Apple/Stripe feel)
 *   flame (#F26A8D) + wine (#890F20) → retained brand accent (warm, appetizing)
 *
 * The original brand tokens (cream / peach / sky / cocoa / flame / rose / wine)
 * are kept so pages not yet migrated to the new system keep rendering correctly.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── New neutral system ── */
        canvas: "#FBFAF8",          // warm near-white page background
        surface: "#FFFFFF",         // cards / raised surfaces
        line: "#ECE9E4",            // hairline borders
        ink: {
          DEFAULT: "#121113",       // near-black headings/text
          soft: "#37343A",          // secondary text
          mut: "#76727B",           // muted/captions
        },

        /* ── Retained brand accent + legacy tokens ── */
        cream: { 50: "#FFFAF1", 100: "#FDF0D5", 200: "#FAE5BC", 300: "#F4D6A0", DEFAULT: "#FDF0D5" },
        peach: { 100: "#FDE2EB", 200: "#F9C8D6", 300: "#F49CBB", DEFAULT: "#F49CBB" },
        sky:   { 50: "#F4F0E5", 100: "#EAE2D0", 200: "#DDD0B5", DEFAULT: "#EAE2D0" },
        cocoa: { 50: "#F5DDDF", DEFAULT: "#890F20", 900: "#5C0915" },
        flame: { 400: "#F49CBB", 500: "#F26A8D", 600: "#C75A68", DEFAULT: "#F26A8D" },
        rose:  { 500: "#C75A68", 600: "#890F20" },
        wine:  { DEFAULT: "#890F20", dark: "#5C0915" },
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-inter)", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        serif:   ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        script:  ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightish: "-0.02em",
        tighter2: "-0.035em",
      },
      boxShadow: {
        // Soft, layered, Apple/Linear-grade elevation
        e1: "0 1px 2px rgba(18,17,19,0.04), 0 1px 1px rgba(18,17,19,0.03)",
        e2: "0 6px 20px -6px rgba(18,17,19,0.10), 0 2px 6px -2px rgba(18,17,19,0.06)",
        e3: "0 24px 60px -20px rgba(18,17,19,0.22), 0 8px 24px -12px rgba(18,17,19,0.12)",
        glow: "0 14px 40px -12px rgba(242,106,141,0.45)",
        ring: "inset 0 0 0 1px rgba(18,17,19,0.06)",
        // legacy
        soft: "0 10px 30px -10px rgba(137,15,32,0.18)",
        card: "0 8px 24px -8px rgba(137,15,32,0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
        "2xl2": "1.5rem",
        "3xl2": "2rem",
        pill: "9999px",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        "float-slow": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-33.333%)" } },
        "marquee-x": { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        // Stripe-style slow drifting gradient mesh
        aurora: {
          "0%,100%": { transform: "translate3d(0,0,0) scale(1)" },
          "33%": { transform: "translate3d(3%,-4%,0) scale(1.08)" },
          "66%": { transform: "translate3d(-3%,3%,0) scale(0.96)" },
        },
        // Linear-style sheen sweep
        shine: { "0%": { backgroundPosition: "200% center" }, "100%": { backgroundPosition: "-200% center" } },
        rise: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "blob-drift": {
          "0%,100%": { transform: "translate(0,0) scale(1)", borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "33%": { transform: "translate(28px,-20px) scale(1.06)", borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "66%": { transform: "translate(-18px,14px) scale(0.97)", borderRadius: "50% 50% 30% 70% / 30% 50% 70% 50%" },
        },
        "blob-drift-alt": {
          "0%,100%": { transform: "translate(0,0) scale(1)", borderRadius: "40% 60% 60% 40% / 40% 50% 60% 50%" },
          "40%": { transform: "translate(-22px,18px) scale(1.04)", borderRadius: "60% 40% 40% 60% / 60% 40% 40% 60%" },
          "75%": { transform: "translate(20px,-12px) scale(0.96)", borderRadius: "30% 70% 50% 50% / 50% 30% 70% 50%" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "float-slow": "float-slow 11s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "marquee-x": "marquee-x 38s linear infinite",
        aurora: "aurora 22s ease-in-out infinite",
        shine: "shine 6s linear infinite",
        rise: "rise 0.8s cubic-bezier(0.22,1,0.36,1) both",
        "blob-drift": "blob-drift 14s ease-in-out infinite",
        "blob-drift-alt": "blob-drift-alt 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
