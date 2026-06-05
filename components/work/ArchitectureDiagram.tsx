import type { ArchNode } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * ArchitectureDiagram — a hand-authored flow of hairline node boxes connected
 * left→right (stacking vertically on mobile). Nodes flagged `critical` form the
 * "agent-trace" critical path: they get an accent border, and the connector
 * leading *into* them is drawn in accent. The accent is the only colour here —
 * everything else stays near-monochrome. No diagram library.
 */
export function ArchitectureDiagram({
  nodes,
  summary,
  className,
}: {
  nodes: ArchNode[];
  summary?: string;
  className?: string;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-bg p-6 shadow-card ring-hairline sm:p-8",
        className,
      )}
    >
      <div className="flex flex-col items-stretch gap-0 lg:flex-row lg:items-stretch">
        {nodes.map((node, i) => {
          // The connector *into* a node is accent when that node is on the
          // critical path. Rendered before every node except the first.
          const connectorAccent = node.critical;
          return (
            <div
              key={node.id}
              className="flex flex-col items-stretch lg:flex-row lg:items-center"
            >
              {i > 0 && <Connector accent={connectorAccent} />}
              <Node node={node} />
            </div>
          );
        })}
      </div>

      {summary ? (
        <figcaption className="mt-6 max-w-[68ch] font-sans text-sm leading-relaxed text-text-secondary">
          {summary}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Node({ node }: { node: ArchNode }) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-1 flex-col justify-center rounded-lg border bg-surface px-4 py-3.5 ring-hairline lg:min-w-[9.5rem]",
        node.critical
          ? "border-accent/20 shadow-glow"
          : "border-border",
      )}
    >
      {node.critical ? (
        <span
          aria-hidden
          className="absolute -top-px left-3 right-3 h-px bg-accent/40"
        />
      ) : null}
      <span className="font-mono text-sm leading-tight font-medium text-text">
        {node.label}
      </span>
      {node.sub ? (
        <span className="mt-1 font-mono text-[0.6875rem] leading-tight text-text-tertiary">
          {node.sub}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Connector between two nodes. Vertical (with a downward chevron) when stacked
 * on mobile; horizontal (with a rightward chevron) on lg. Accent when it feeds
 * a critical-path node.
 */
function Connector({ accent }: { accent?: boolean }) {
  const line = accent ? "bg-accent/50" : "bg-border-strong";
  const arrow = accent ? "border-accent/60" : "border-border-strong";

  return (
    <div aria-hidden className="flex items-center justify-center">
      {/* mobile: vertical connector */}
      <div className="flex h-7 flex-col items-center justify-center lg:hidden">
        <span className={cn("w-px flex-1", line)} />
        <span
          className={cn(
            "h-1.5 w-1.5 -mt-0.5 rotate-45 border-b border-r",
            arrow,
          )}
        />
      </div>
      {/* desktop: horizontal connector */}
      <div className="hidden h-px w-8 items-center justify-center lg:flex">
        <span className={cn("h-px flex-1", line)} />
        <span
          className={cn(
            "h-1.5 w-1.5 -ml-0.5 -rotate-45 border-b border-r",
            arrow,
          )}
        />
      </div>
    </div>
  );
}
