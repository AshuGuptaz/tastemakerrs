/**
 * Server-renderable twin of <ShimmerText> (see CssBlurText for why): same
 * 1.4s blur/opacity/y reveal + infinite flame shimmer sweep, but pure CSS so it
 * is visible at first paint instead of after hydration.
 */
import { cn } from "@/lib/utils";

export default function CssShimmerText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  /** seconds before the reveal + shimmer start */
  delay?: number;
}) {
  return (
    <span
      className={cn(
        "hero-shimmer inline-block bg-[length:200%_100%] bg-gradient-to-r from-flame-400 via-wheat-50 to-flame-400 bg-clip-text italic leading-[1.35] text-transparent",
        className
      )}
      style={{ animationDelay: `${delay}s, ${delay}s` }}
    >
      {text}
    </span>
  );
}
