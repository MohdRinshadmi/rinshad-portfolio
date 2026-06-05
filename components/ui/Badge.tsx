import { cn } from "@/lib/utils";

type BadgeTone = "accent" | "positive" | "neutral";

const toneText: Record<BadgeTone, string> = {
  accent: "text-accent",
  positive: "text-positive",
  neutral: "text-text-secondary",
};

const toneDot: Record<BadgeTone, string> = {
  accent: "bg-accent",
  positive: "bg-positive",
  neutral: "bg-text-tertiary",
};

/**
 * Badge — small status pill. `live` shows a pulsing positive dot (availability);
 * `tone` colors the dot + text. Mono, hairline surface.
 */
export function Badge({
  children,
  live = false,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  live?: boolean;
  tone?: BadgeTone;
  className?: string;
}) {
  const dot = live
    ? "bg-positive animate-pulse-dot"
    : toneDot[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-xs leading-none",
        live ? toneText.positive : toneText[tone],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 shrink-0 rounded-full", dot)}
      />
      {children}
    </span>
  );
}
