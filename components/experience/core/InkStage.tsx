import { cn } from "@/lib/utils";

/* ============================================================================
   InkStage — the journey's section shell: a full-bleed dark "ink" panel with
   generous radius, set into the paper page. Keeps the fixed light Navbar and
   Footer legible while each stage goes fully cinematic inside.

   Server component: the shell + semantic copy render on the server; only the
   canvases inside hydrate. That's what keeps SEO/LCP intact under heavy 3D.
   ========================================================================== */

interface InkStageProps {
  id: string;
  /** Accessible section name (also used by the journey skip-nav). */
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function InkStage({ id, label, children, className }: InkStageProps) {
  return (
    <section
      id={id}
      aria-label={label}
      className="relative px-2 py-2 sm:px-3 sm:py-3"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-[2rem] bg-ink text-ink-text ring-hairline-ink",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Shared eyebrow/heading lockup used at the top of each stage. */
export function StageHeading({
  eyebrow,
  title,
  blurb,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  blurb?: string;
  align?: "left" | "center";
}) {
  return (
    <header className={cn("relative z-10", align === "center" && "text-center")}>
      <p className="font-grotesk text-eyebrow font-medium uppercase tracking-[0.14em] text-accent">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-display-lg font-semibold tracking-tight text-ink-text">
        {title}
      </h2>
      {blurb && (
        <p
          className={cn(
            "mt-4 max-w-xl text-body-lg text-ink-text-secondary",
            align === "center" && "mx-auto",
          )}
        >
          {blurb}
        </p>
      )}
    </header>
  );
}
