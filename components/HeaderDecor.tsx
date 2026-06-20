/**
 * Ambient decoration for empty page-header bands: hand-drawn, flat vector
 * bakery illustrations (cake / cupcake / macaron / cookie) floating gently
 * over soft color blobs. Drawn entirely in the brand palette.
 *
 * Pure CSS/SVG — no photos, no WebGL, tiny footprint, and the float motion
 * auto-stills under prefers-reduced-motion (global reduced-motion block).
 *
 * tone="light" → cream/peach/sky header backgrounds.
 * tone="bold"  → the saturated flame header background.
 * set          → kept for per-page variety (mirrors the layout subtly).
 */
type Tone = "light" | "bold";

type SvgProps = { className?: string; style?: React.CSSProperties };

function Cake({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <ellipse cx="50" cy="89" rx="43" ry="6" fill="#FFFAF1" />
      <rect x="18" y="58" width="64" height="30" rx="9" fill="#F49CBB" />
      <path d="M18 50 H82 V60 q-4 7 -8 0 q-4 7 -8 0 q-4 7 -8 0 q-4 7 -8 0 q-4 7 -8 0 q-4 7 -8 0 q-4 7 -8 0 q-4 7 -8 0 Z" fill="#FDE2EB" />
      <rect x="34" y="38" width="32" height="22" rx="8" fill="#F26A8D" />
      <path d="M34 32 H66 V41 q-4 7 -8 0 q-4 7 -8 0 q-4 7 -8 0 q-4 7 -8 0 Z" fill="#FDE2EB" />
      <rect x="48" y="21" width="4" height="13" rx="2" fill="#FFFAF1" />
      <path d="M50 13 c3.6 3.6 3.6 7.8 0 8.8 c-3.6-1-3.6-5.2 0-8.8 Z" fill="#C75A68" />
      <circle cx="40" cy="71" r="1.7" fill="#FFFAF1" />
      <circle cx="60" cy="74" r="1.7" fill="#890F20" />
      <circle cx="50" cy="68" r="1.7" fill="#890F20" />
      <circle cx="44" cy="50" r="1.6" fill="#890F20" />
      <circle cx="57" cy="51" r="1.6" fill="#FFFAF1" />
    </svg>
  );
}

function Cupcake({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <path d="M33 62 H67 L61 96 a3 3 0 0 1 -3 2 H42 a3 3 0 0 1 -3 -2 Z" fill="#F49CBB" />
      <path d="M42 64 L40 95 M50 64 L50 96 M58 64 L60 95" stroke="#C75A68" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <rect x="30" y="57" width="40" height="9" rx="4.5" fill="#F9C8D6" />
      <circle cx="39" cy="56" r="11" fill="#F26A8D" />
      <circle cx="61" cy="56" r="11" fill="#F26A8D" />
      <circle cx="50" cy="54" r="13" fill="#F26A8D" />
      <circle cx="43" cy="46" r="9" fill="#F26A8D" />
      <circle cx="57" cy="46" r="9" fill="#F26A8D" />
      <circle cx="50" cy="39" r="8" fill="#F26A8D" />
      <circle cx="45" cy="50" r="3" fill="#FDE2EB" opacity="0.85" />
      <circle cx="54" cy="44" r="2.3" fill="#FDE2EB" opacity="0.85" />
      <circle cx="50" cy="31" r="5" fill="#C75A68" />
      <circle cx="48" cy="29" r="1.4" fill="#FDE2EB" />
      <circle cx="40" cy="58" r="1.5" fill="#FFFAF1" />
      <circle cx="60" cy="60" r="1.5" fill="#FFFAF1" />
    </svg>
  );
}

function Macaron({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <path d="M20 50 a30 19 0 0 1 60 0 Z" fill="#F49CBB" />
      <rect x="20" y="48" width="60" height="10" rx="3.5" fill="#FFFAF1" />
      <path d="M20 56 a30 17 0 0 0 60 0 Z" fill="#F49CBB" />
      <circle cx="29" cy="50" r="2.6" fill="#F9C8D6" />
      <circle cx="71" cy="50" r="2.6" fill="#F9C8D6" />
      <path d="M33 39 a20 11 0 0 1 26 -4" stroke="#FDE2EB" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function Cookie({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <circle cx="50" cy="52" r="30" fill="#F4D6A0" />
      <circle cx="40" cy="44" r="3.4" fill="#5C0915" />
      <circle cx="61" cy="46" r="3.8" fill="#890F20" />
      <circle cx="50" cy="61" r="3.2" fill="#5C0915" />
      <circle cx="42" cy="63" r="2.6" fill="#890F20" />
      <circle cx="64" cy="62" r="3" fill="#5C0915" />
      <circle cx="52" cy="42" r="2.4" fill="#890F20" />
      <circle cx="34" cy="55" r="2.6" fill="#5C0915" />
    </svg>
  );
}

function Sparkle({ className, style }: SvgProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 0 C13 7 17 11 24 12 C17 13 13 17 12 24 C11 17 7 13 0 12 C7 11 11 7 12 0 Z" fill="currentColor" />
    </svg>
  );
}

const TREATS = [
  { C: Cake,    pos: "right-[6%] top-[24%]",     size: "h-28 w-28 lg:h-44 lg:w-44", anim: "animate-float",      rot: -6,  delay: "0s" },
  { C: Cupcake, pos: "right-[29%] top-[13%]",    size: "h-20 w-20 lg:h-24 lg:w-24", anim: "animate-float-slow", rot: 7,   delay: "1.4s" },
  { C: Macaron, pos: "right-[19%] bottom-[14%]", size: "h-16 w-16 lg:h-20 lg:w-20", anim: "animate-float",      rot: -9,  delay: "2.6s" },
  { C: Cookie,  pos: "right-[37%] bottom-[32%]", size: "h-14 w-14 lg:h-16 lg:w-16", anim: "animate-float-slow", rot: 12,  delay: "0.7s" },
];

export default function HeaderDecor({ tone = "light", set }: { tone?: Tone; set?: string }) {
  const bold = tone === "bold";
  // subtle per-page mirroring so headers don't look identical
  const flip = set === "cakes" || set === "sweets" ? -1 : 1;
  const dropShadow = bold
    ? "drop-shadow(0 12px 14px rgba(92,9,21,0.35))"
    : "drop-shadow(0 12px 14px rgba(137,15,32,0.22))";
  const glow = bold ? "rgba(255,255,255,0.30)" : "rgba(242,106,141,0.18)";
  const blobA = bold ? "bg-white/15" : "bg-flame/14";
  const blobB = bold ? "bg-peach-200/30" : "bg-peach-300/35";
  const sparkle = bold ? "text-white/80" : "text-flame/60";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* soft color blobs for ambient depth */}
      <div className={`absolute -right-16 -top-20 h-80 w-80 rounded-full ${blobA} blur-3xl animate-blob-drift`} />
      <div className={`absolute right-[16%] -bottom-24 h-96 w-96 rounded-full ${blobB} blur-3xl animate-blob-drift-alt`} />

      {/* floating bakery illustrations (desktop only — they'd crowd the heading on mobile) */}
      {TREATS.map(({ C, pos, size, anim, rot, delay }, i) => (
        <div key={i} className={`absolute ${pos} ${size} ${anim} hidden md:block`} style={{ animationDelay: delay }}>
          <span className="absolute -inset-3 rounded-full blur-xl" style={{ background: glow }} />
          <C className="relative h-full w-full" style={{ filter: dropShadow, transform: `rotate(${rot * flip}deg)` }} />
        </div>
      ))}

      <Sparkle className={`absolute right-[15%] top-[19%] hidden h-5 w-5 md:block ${sparkle}`} />
      <Sparkle className={`absolute right-[34%] bottom-[20%] hidden h-3.5 w-3.5 md:block ${sparkle}`} />
    </div>
  );
}
