import { SectionHeading } from "@/components/ui/SectionHeading";
import { testimonials } from "@/lib/data";

/**
 * Testimonials — editorial serif pull-quotes.
 * Server component. Returns null when there are no real quotes
 * (principle: no fakes — the slot stays designed but silent).
 */
export function Testimonials() {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="section-py">
      <div className="container-page">
        <SectionHeading
          eyebrow="TESTIMONIALS"
          title={
            <>
              In their{" "}
              <span className="font-serif italic">words</span>
            </>
          }
        />

        <ul className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border ring-hairline md:mt-16 md:grid-cols-2">
          {testimonials.map((t) => (
            <li key={`${t.name}-${t.title}`} className="bg-surface">
              <figure className="flex h-full flex-col gap-8 p-9 md:p-11">
                <span
                  aria-hidden="true"
                  className="-mb-6 font-serif text-7xl leading-none text-accent/30 select-none"
                >
                  &ldquo;
                </span>

                <blockquote className="font-serif text-body-lg leading-relaxed text-balance text-text">
                  {t.quote}
                </blockquote>

                <figcaption className="mt-auto flex flex-col gap-0.5">
                  <span className="font-mono text-sm text-text">{t.name}</span>
                  <span className="font-mono text-xs uppercase tracking-wide text-text-tertiary">
                    {t.title}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
