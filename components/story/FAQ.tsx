import { Plus } from "lucide-react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { faqs } from "@/lib/content/faq";

/**
 * FAQ — the documentary's appendix. Native <details>/<summary> so every answer
 * is in the DOM at load (indexable, keyboard-accessible, zero JS) while still
 * reading as a quiet editorial accordion. The matching FAQPage JSON-LD is
 * emitted from the homepage; this is the human-readable half of the same data.
 */
export function FAQ() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="section-py"
    >
      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <Eyebrow className="justify-center">Frequently Asked</Eyebrow>
            <h2
              id="faq-heading"
              className="mt-6 font-display text-display-lg text-balance text-text"
            >
              Questions, answered.
            </h2>
          </Reveal>

          <Reveal delay={0.08} className="mt-14 border-t border-border-strong">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group border-b border-border"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-h3 font-medium text-text transition-colors duration-200 group-open:text-accent">
                    {faq.question}
                  </h3>
                  <Plus
                    aria-hidden="true"
                    className="mt-1 size-5 shrink-0 text-text-tertiary transition-transform duration-300 ease-out group-open:rotate-45 group-open:text-accent"
                    strokeWidth={1.75}
                  />
                </summary>
                <p className="max-w-[64ch] pb-7 text-body-lg text-text-secondary">
                  {faq.answer}
                </p>
              </details>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
