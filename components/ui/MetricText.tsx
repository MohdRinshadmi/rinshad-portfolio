import { Fragment } from "react";
import { splitMetrics } from "@/lib/content/metrics";

/**
 * MetricText — a résumé sentence with its proof tokens ("35%", "2,000+") set
 * as quiet accent chips, so the numbers read at a glance. Server-safe: the
 * splitting is pure string work, tested in lib/content/metrics.ts.
 */
export function MetricText({ text }: { text: string }) {
  return (
    <>
      {splitMetrics(text).map((segment, i) =>
        segment.isMetric ? (
          <span
            key={i}
            className="mx-0.5 inline-flex items-center rounded-md border border-accent/20 bg-accent/10 px-1.5 py-px align-baseline font-mono text-[0.8em] leading-none whitespace-nowrap text-accent-text"
          >
            {segment.text}
          </span>
        ) : (
          <Fragment key={i}>{segment.text}</Fragment>
        ),
      )}
    </>
  );
}
