/**
 * Warm field behind the landing page. STATIC and GPU-promoted on purpose:
 * radial-gradients are naturally soft (no blur filter needed) and the layer is
 * promoted with translateZ(0) so it rasterizes once and is skipped on every
 * scroll frame — zero per-frame cost, buttery scrolling.
 *
 * The mesh is a layered set of offset warm stops + ONE faint cool counter-tone
 * (Stripe/Linear trick) so the warm reads as "lit", not "filled".
 */
export default function AuroraBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ transform: "translateZ(0)", contain: "strict" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(60% 50% at 12% 8%,  rgba(214,122,71,0.26), transparent 60%),
            radial-gradient(50% 45% at 88% 0%,  rgba(224,139,90,0.20), transparent 62%),
            radial-gradient(55% 60% at 78% 88%, rgba(164,71,42,0.15), transparent 64%),
            radial-gradient(45% 40% at 30% 80%, rgba(244,233,214,0.45), transparent 66%),
            radial-gradient(40% 35% at 50% 50%, rgba(120,140,150,0.05), transparent 70%)`,
        }}
      />
      <div className="absolute inset-0 bg-dots mask-fade opacity-25" />
    </div>
  );
}
