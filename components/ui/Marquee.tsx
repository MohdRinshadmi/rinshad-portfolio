import { cn } from "@/lib/utils";

/* ----------------------------------------------------------------------------
   Marquee — server component, pure CSS (no hooks).
   Children are duplicated into a flex track that scrolls -50% via the
   `animate-marquee` keyframe; speed comes from the inline `--marquee-duration`.
   Edges are softened with `mask-fade-x`. Transform-only, GPU-cheap.
   The duplicate track is aria-hidden so screen readers read content once.
   -------------------------------------------------------------------------- */

interface MarqueeProps {
  children: React.ReactNode;
  /** seconds for one full loop; lower = faster. */
  durationSec?: number;
  /** scroll right-to-left (default) or reverse. */
  reverse?: boolean;
  className?: string;
}

export function Marquee({
  children,
  durationSec = 32,
  reverse = false,
  className,
}: MarqueeProps) {
  return (
    <div
      className={cn("mask-fade-x group relative w-full overflow-hidden", className)}
    >
      <div
        className="flex w-max shrink-0 animate-marquee items-center"
        style={
          {
            "--marquee-duration": `${durationSec}s`,
            animationDirection: reverse ? "reverse" : "normal",
          } as React.CSSProperties
        }
      >
        {/* Both copies sit in one animated track; translating -50% loops seamlessly. */}
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
