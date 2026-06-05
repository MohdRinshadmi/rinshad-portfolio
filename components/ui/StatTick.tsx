import { cn } from "@/lib/utils";

/**
 * StatTick — inline mono metric like `▸ 60fps`.
 * Small accent triangle marker + quiet mono value.
 */
export function StatTick({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs text-text-secondary",
        className,
      )}
    >
      <span aria-hidden="true" className="text-accent">
        ▸
      </span>
      {children}
    </span>
  );
}
