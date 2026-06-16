import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

interface ChapterMarkProps {
  number: string;
  title: string;
  intro?: string;
  className?: string;
}

/**
 * ChapterMark — the documentary's chapter opener. A quiet "CHAPTER ── NN" rule
 * line, then the chapter title set large in the editorial serif. Server
 * component; entrance handled by the Reveal client primitive.
 */
export function ChapterMark({ number, title, intro, className }: ChapterMarkProps) {
  return (
    <Reveal className={cn(className)}>
      <div className="flex items-center gap-5">
        <span className="font-grotesk text-eyebrow font-medium uppercase text-text-tertiary">
          Chapter
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-border-strong" />
        <span className="font-mono text-eyebrow text-accent">{number}</span>
      </div>
      <h2 className="mt-7 font-serif text-display-xl text-text">{title}</h2>
      {intro ? (
        <p className="mt-6 max-w-[56ch] text-body-lg text-text-secondary">{intro}</p>
      ) : null}
    </Reveal>
  );
}
