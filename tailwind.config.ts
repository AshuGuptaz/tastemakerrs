import type { Config } from "tailwindcss";

/**
 * Brand palette — locked to the customer's spec:
 *   F26A8D · F49CBB · 890F20 · C75A68 · FDF0D5
 *
 * We preserve the original Tailwind class names (cream / peach / sky / cocoa /
 * flame / rose) and just re-map them to the new colors so all existing
 * components inherit the new look without per-component edits.
 *
 *   cream  → FDF0D5  (cream paper bg)
 *   flame  → F26A8D  (primary pink CTA)
 *   peach  → F49CBB  (light pink accents)
 *   rose   → C75A68  (rose hover/secondary)
 *   cocoa  → 890F20  (wine deep — text & dark surfaces)
 *   sky    → soft warm-blue tint, repurposed for cool break sections
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  "#FFFAF1",
          100: "#FDF0D5",
          200: "#FAE5BC",
          300: "#F4D6A0",
          DEFAULT: "#FDF0D5",
        },
        peach: {
          100: "#FDE2EB",
          200: "#F9C8D6",
          300: "#F49CBB",
          DEFAULT: "#F49CBB",
        },
        sky: {
          50:  "#F4F0E5",
          100: "#EAE2D0",
          200: "#DDD0B5",
          DEFAULT: "#EAE2D0",
        },
        cocoa: {
          50:  "#F5DDDF",
          DEFAULT: "#890F20",
          900:  "#5C0915",
        },
        flame: {
          400: "#F49CBB",
          500: "#F26A8D",
          600: "#C75A68",
          DEFAULT: "#F26A8D",
        },
        rose: {
          500: "#C75A68",
          600: "#890F20",
        },
        wine: {
          DEFAULT: "#890F20",
          dark:    "#5C0915",
        },
      },
      fontFamily: {
        display: ["var(--font-anton)", "Impact", "ui-sans-serif", "system-ui", "sans-serif"],
        serif:   ["var(--font-archivo)", "ui-serif", "Georgia", "serif"],
        script:  ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
        sans:    ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        tightish: "-0.02em",
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(137,15,32,0.18)",
        card: "0 8px 24px -8px rgba(137,15,32,0.12)",
        glow: "0 0 0 6px rgba(242,106,141,0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
        pill: "9999px",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "float-slow": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "blob-drift": {
          "0%,100%": { transform: "translate(0,0) scale(1)", borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "33%":      { transform: "translate(28px,-20px) scale(1.06)", borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "66%":      { transform: "translate(-18px,14px) scale(0.97)", borderRadius: "50% 50% 30% 70% / 30% 50% 70% 50%" },
        },
        "blob-drift-alt": {
          "0%,100%": { transform: "translate(0,0) scale(1)", borderRadius: "40% 60% 60% 40% / 40% 50% 60% 50%" },
          "40%":      { transform: "translate(-22px,18px) scale(1.04)", borderRadius: "60% 40% 40% 60% / 60% 40% 40% 60%" },
          "75%":      { transform: "translate(20px,-12px) scale(0.96)", borderRadius: "30% 70% 50% 50% / 50% 30% 70% 50%" },
        },
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "float-slow": "float-slow 11s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        "ken-burns": "ken-burns 18s ease-out forwards",
        rise: "rise 0.8s cubic-bezier(0.22,1,0.36,1) both",
        "blob-drift": "blob-drift 14s ease-in-out infinite",
        "blob-drift-alt": "blob-drift-alt 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
