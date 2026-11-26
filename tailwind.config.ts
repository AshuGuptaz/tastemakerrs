import type { Config } from "tailwindcss";

/**
 * Design tokens — Tastemakerrs Brand Identity v5.
 * Palette: cocoa #6A2A1B · cream #F6E7C9 · kraft #E4C79D · blush #F0A7B8 ·
 * sage #A8C3A0 · periwinkle #8F9FD3 · butter #F4CF7A on paper #FBF5EA.
 * Type: Fredoka SemiBold (display) + DM Sans (text).
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── BRAND v5 "a bakery palette" (Tastemakerrs Brand Guidelines v5).
              Cocoa + cream do the talking; pastels are accents, one or two at a
              time. Legacy token NAMES are kept and remapped so every component
              inherits the new identity without per-file edits. ── */
        canvas: "#FBF5EA",          // paper — page ground
        surface: "#FFFBF4",         // cards, a hair brighter than paper
        line: "#EBDCC3",            // kraft-tinted hairline
        ink: {
          DEFAULT: "#2A140D",       // brand ink — near-black brown for small text
          soft: "#4E3127",          // secondary text
          mut: "#7A5A4C",           // muted / captions (AA on paper + cream)
        },

        /* brand primaries */
        paper: "#FBF5EA",
        kraft: { 50: "#F6EBDA", 100: "#EFDDC2", DEFAULT: "#E4C79D", deep: "#CFAB7B" },
        blush: { 50: "#FDF0F3", 100: "#FBE3E8", 200: "#F7CBD5", DEFAULT: "#F0A7B8" },
        sage:  { 50: "#F1F6EF", 100: "#E2ECDF", DEFAULT: "#A8C3A0" },
        peri:  { 50: "#F1F3FB", 100: "#E3E7F6", DEFAULT: "#8F9FD3" },
        butter:{ 50: "#FEF8EA", 100: "#FCEFCF", DEFAULT: "#F4CF7A" },

        /* cocoa = PRIMARY brand colour (buttons, headlines, dark surfaces) */
        cocoa: { 50: "#F8EDE6", 100: "#EED8CC", DEFAULT: "#6A2A1B", deep: "#4A1B10", 900: "#2A140D" },
        cream: { 50: "#FDF7EC", 100: "#FAEFDB", 200: "#F6E7C9", 300: "#E4C79D", DEFAULT: "#F6E7C9" },

        /* "flame" was the accent token — it now resolves to cocoa so every
           CTA / link / ring picks up the brand primary. flame-400 is the
           butter highlight used for small accents ON cocoa/dark surfaces. */
        flame: { 400: "#F4CF7A", 500: "#8C3E28", 600: "#7A321F", 700: "#4A1B10", 800: "#3A140B", DEFAULT: "#6A2A1B" },
        rose:  { 50: "#FDF0F3", 200: "#F7CBD5", 500: "#4A1B10", 600: "#3A140B" },
        wine:  { DEFAULT: "#4A1B10", dark: "#2A140D" },
        peach: { 100: "#FBE3E8", 200: "#F7CBD5", 300: "#F0A7B8", DEFAULT: "#F0A7B8" },
        sky:   { 50: "#F1F3FB", 100: "#E3E7F6", 200: "#C9D0EE", DEFAULT: "#E3E7F6" },
        clay:  { 50: "#F6EBDA", 100: "#EFDDC2", 200: "#E4C79D", DEFAULT: "#EFDDC2" },
        wheat: { 50: "#FBF1DE", 100: "#F6E7C9", DEFAULT: "#FBF1DE" },
        espresso: { DEFAULT: "#4A1B10", deep: "#2A140D" },
      },
      fontFamily: {
        // Brand v5 "two voices": DM Sans for text, Fredoka SemiBold for display
        // (rounded like piping). Both SIL OFL, served by next/font.
        sans:    ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "ui-rounded", "ui-sans-serif", "system-ui", "sans-serif"],
        serif:   ["var(--font-display)", "ui-rounded", "ui-sans-serif", "sans-serif"],
        script:  ["var(--font-display)", "ui-rounded", "sans-serif"],
      },
      letterSpacing: {
        tightish: "-0.02em",
        tighter2: "-0.035em",
      },
      boxShadow: {
        // Soft, layered, Apple/Linear-grade elevation
        e1: "0 1px 2px rgba(74,27,16,0.04), 0 1px 1px rgba(74,27,16,0.03)",
        e2: "0 6px 20px -6px rgba(74,27,16,0.10), 0 2px 6px -2px rgba(74,27,16,0.06)",
        e3: "0 24px 60px -20px rgba(74,27,16,0.22), 0 8px 24px -12px rgba(74,27,16,0.12)",
        glow: "0 14px 40px -12px rgba(106,42,27,0.35)",
        ring: "inset 0 0 0 1px rgba(74,27,16,0.06)",
        // legacy
        soft: "0 10px 30px -10px rgba(74,27,16,0.14)",
        card: "0 8px 24px -8px rgba(74,27,16,0.10)",
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
        // Stripe-style slow drifting gradient mesh.
        // PERF: translate-ONLY (no scale). These animate on large blur-2xl
        // elements; scaling a blurred layer forces the browser to re-rasterize
        // the (expensive) blur every frame. Translate of a pre-blurred layer is
        // a cheap GPU composite, so the drift stays buttery. Same reasoning for
        // the blob-drift keyframes below — border-radius is held constant
        // (morphing it repaints the blur each frame) so the organic shape is
        // static while the blob still drifts.
        aurora: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "33%": { transform: "translate3d(3%,-4%,0)" },
          "66%": { transform: "translate3d(-3%,3%,0)" },
        },
        // Linear-style sheen sweep
        shine: { "0%": { backgroundPosition: "200% center" }, "100%": { backgroundPosition: "-200% center" } },
        rise: { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        // Soft expanding glow ring (box-shadow only — stays tight around the button)
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(106,42,27,0.35)" },
          "70%,100%": { boxShadow: "0 0 0 14px rgba(106,42,27,0)" },
        },
        "blob-drift": {
          "0%,100%": { transform: "translate(0,0)", borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "33%": { transform: "translate(28px,-20px)", borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "66%": { transform: "translate(-18px,14px)", borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
        },
        "blob-drift-alt": {
          "0%,100%": { transform: "translate(0,0)", borderRadius: "40% 60% 60% 40% / 40% 50% 60% 50%" },
          "40%": { transform: "translate(-22px,18px)", borderRadius: "40% 60% 60% 40% / 40% 50% 60% 50%" },
          "75%": { transform: "translate(20px,-12px)", borderRadius: "40% 60% 60% 40% / 40% 50% 60% 50%" },
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
        "pulse-ring": "pulse-ring 2.2s ease-out infinite",
        "blob-drift": "blob-drift 14s ease-in-out infinite",
        "blob-drift-alt": "blob-drift-alt 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
