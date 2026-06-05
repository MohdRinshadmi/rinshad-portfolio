import { cn } from "@/lib/utils";

/**
 * Chip — mono tech/tag pill. Quiet by default; `accent` for the rare highlight.
 */
export function Chip({
  children,
  accent = false,
  size = "md",
  className,
}: {
  children: React.ReactNode;
  accent?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-mono leading-none whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[0.6875rem]" : "px-2.5 py-1 text-xs",
        accent
          ? "border-accent/20 bg-accent/10 text-accent"
          : "border-border bg-surface/60 text-text-secondary",
        className,
      )}
    >
      {children}
    </span>
  );
}
