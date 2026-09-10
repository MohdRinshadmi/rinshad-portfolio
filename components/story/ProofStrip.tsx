import { CountUp } from "@/components/motion/CountUp";
import { proofStats } from "@/lib/content/profile";

/**
 * ProofStrip — the credibility band directly under the hero. Six résumé-backed
 * facts a recruiter can take in without scrolling further.
 *
 * Server component: the final values are in the HTML, and only the counters
 * hydrate. Six cells collapse to three columns on tablets and two on phones.
 */
export function ProofStrip() {
  return (
    <section aria-labelledby="proof-heading" className="border-y border-border bg-bg-subtle">
      <h2 id="proof-heading" className="sr-only">
        At a glance
      </h2>
      <div className="container-page">
        <ul className="grid grid-cols-2 gap-x-6 md:grid-cols-3 xl:grid-cols-6 xl:gap-x-8">
          {proofStats.map((stat) => {
            const numeric = typeof stat.to === "number";
            return (
              <li key={stat.label} className="flex flex-col gap-2.5 py-7 sm:py-9">
                <span className="flex min-h-11 items-end font-display leading-none tracking-[-0.03em] text-text">
                  {numeric ? (
                    <CountUp
                      to={stat.to as number}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                      className="text-[clamp(2.25rem,3.6vw,2.875rem)] font-medium"
                    />
                  ) : (
                    <span className="text-[1.375rem] font-medium leading-[1.15] tracking-tight">
                      {stat.value}
                    </span>
                  )}
                </span>
                <span className="max-w-[20ch] font-mono text-xs leading-snug text-text-tertiary">
                  {stat.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
