import type { Metadata } from "next";

import { projects } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { WorkFilter } from "@/components/work/WorkFilter";

export const metadata: Metadata = buildMetadata({
  title: "Work",
  description:
    "Selected work — AI products, real-time systems, and full-stack platforms.",
  path: "/work",
});

/**
 * /work — index of selected projects.
 *
 * Server component: a lite editorial header (eyebrow + h1 + short intro)
 * over the `WorkFilter` client island, which owns the category chips and the
 * filtered `ProjectCard` grid. The full `projects` array is passed down so the
 * island can derive its own category set.
 */
export default function WorkPage() {
  return (
    <div className="section-py">
      <div className="container-page">
        {/* Lite header */}
        <header className="max-w-3xl">
          <Eyebrow dot>Selected Work</Eyebrow>

          <h1 className="mt-5 font-display text-display-xl text-text text-balance">
            AI products, real-time systems, and full-stack platforms.
          </h1>

          <p className="mt-6 max-w-[58ch] text-body-lg text-text-secondary">
            A focused set of production work — streaming AI copilots, conflict-free
            real-time collaboration, and live telemetry at scale. Each one shipped
            to real users, owned end-to-end from architecture to performance.
          </p>
        </header>

        {/* Filterable project grid (client island) */}
        <WorkFilter projects={projects} className="mt-16 lg:mt-20" />
      </div>
    </div>
  );
}
