import { cn } from "@/lib/utils";

/**
 * Eyebrow — quiet mono kicker above section headings.
 * Uppercase, tracked, tertiary ink. Optional leading accent dot, or a Formix-style
 * rounded-pill frame (`pill`) for numbered section labels like "/ 03 / SELECTED WORK".
 */
export function Eyebrow({
  children,
  dot = false,
  pill = false,
  className,
}: {
  children: React.ReactNode;
  dot?: boolean;
  pill?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-grotesk text-eyebrow font-medium uppercase text-text-tertiary",
        pill && "rounded-full border border-border bg-surface/70 px-3.5 py-2 ring-hairline",
        className,
      )}
    >
      {dot ? (
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-accent" />
      ) : null}
      {children}
    </span>
  );
}
