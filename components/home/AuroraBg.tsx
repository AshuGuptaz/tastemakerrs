/**
 * Warm field behind the landing page. STATIC and GPU-promoted on purpose:
 * radial-gradients are naturally soft (no blur filter needed) and the layer is
 * promoted with translateZ(0) so it rasterizes once and is skipped on every
 * scroll frame — zero per-frame cost, buttery scrolling. (Earlier this animated
 * three blur-3xl blobs every frame, which is what caused the jank.)
 */
export default function AuroraBg() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ transform: "translateZ(0)", contain: "strict" }}
    >
      <div className="absolute left-[-12%] top-[-18%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.20),transparent_60%)]" />
      <div className="absolute right-[-14%] top-[24%] h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(253,186,116,0.18),transparent_62%)]" />
      <div className="absolute bottom-[-16%] left-[28%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(234,88,12,0.13),transparent_64%)]" />
      <div className="absolute inset-0 bg-dots opacity-30" />
    </div>
  );
}
