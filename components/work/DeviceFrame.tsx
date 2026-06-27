import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DeviceFrameProps {
  /** Centered placeholder caption (mono). Ignored when `children` are provided. */
  label?: string;
  /** Frame chrome + aspect: a browser window or a phone. Default "browser". */
  variant?: "browser" | "phone";
  className?: string;
  /** Real screenshot/media. Rendered in place of the placeholder field when present. */
  children?: ReactNode;
}

/**
 * DeviceFrame — a dark glossy media panel (server component) that reads as a
 * product shot on the light editorial page (the Formix register).
 *
 * Renders a tasteful screenshot PLACEHOLDER (a dark "product" field with a faint
 * ink grid + ember glow and a mono caption) inside a browser window (3-dot bar)
 * or a phone (notch + tall aspect). When `children` are passed they fill the
 * screen area instead. Aspect ratio is reserved to avoid layout shift (CLS).
 */
export function DeviceFrame({ label, variant = "browser", className, children }: DeviceFrameProps) {
  const isPhone = variant === "phone";

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-ink ring-hairline-ink shadow-card",
        "border border-ink-border",
        isPhone ? "mx-auto max-w-[300px] rounded-[2rem]" : "rounded-xl sm:rounded-2xl",
        className,
      )}
    >
      {/* Chrome — browser top bar */}
      {!isPhone && (
        <div className="flex items-center gap-3 border-b border-ink-border bg-ink-raised px-4 py-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
          </div>
          <div className="hidden flex-1 sm:block">
            <div className="mx-auto h-5 w-1/2 max-w-[220px] rounded-full border border-ink-border bg-white/5" />
          </div>
        </div>
      )}

      {/* Phone notch */}
      {isPhone && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-2.5">
          <div className="h-5 w-24 rounded-full bg-white/10" aria-hidden="true" />
        </div>
      )}

      {/* Screen — aspect reserved to avoid CLS */}
      <div
        className={cn(
          "relative w-full overflow-hidden bg-product",
          isPhone ? "aspect-[9/19.5]" : "aspect-16/12",
        )}
      >
        {children ? (
          children
        ) : (
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-grid-ink opacity-70 [mask-image:radial-gradient(80%_80%_at_50%_42%,#000,transparent)]"
              aria-hidden="true"
            />
            {/* Centered caption */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <span className="text-center font-mono text-eyebrow uppercase text-ink-text-tertiary">
                {label ?? "Preview"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
