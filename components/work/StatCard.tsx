"use client";

import { CountUp } from "@/components/motion/CountUp";
import { cn } from "@/lib/utils";

/**
 * StatCard — a single headline result on the case study (Results block).
 * Big display value + quiet mono label, on a surface card with a hairline.
 *
 * The `value` is a string. When it is *purely* numeric (e.g. "3"), animate it
 * with <CountUp/>; otherwise (e.g. "<1s", "60fps", "10k+", "Live") render the
 * string verbatim — counting a non-number would be meaningless.
 */
export function StatCard({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  const trimmed = value.trim();
  const isPureNumber = /^-?\d+(\.\d+)?$/.test(trimmed);
  const decimals = isPureNumber && trimmed.includes(".")
    ? trimmed.split(".")[1].length
    : 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-6 shadow-card ring-hairline",
        className,
      )}
    >
      <div className="font-display text-display-lg leading-none text-text">
        {isPureNumber ? (
          <CountUp to={Number(trimmed)} decimals={decimals} />
        ) : (
          value
        )}
      </div>
      <div className="mt-3 font-mono text-eyebrow text-text-tertiary uppercase">
        {label}
      </div>
    </div>
  );
}
