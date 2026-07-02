import type { Metadata } from "next";

import { projects } from "@/lib/content/projects";
import { buildMetadata } from "@/lib/seo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { WorkFilter } from "@/components/work/WorkFilter";

export const metadata: Metadata = buildMetadata({
  title: "Work",
  description:
    "Selected full-stack work across web and mobile — React, Next.js, React Native, and Node.js apps spanning AI products, real-time systems, and cloud-native platforms.",
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
            Full-stack work — web, mobile, real-time, and AI.
          </h1>

          <p className="mt-6 max-w-[58ch] text-body-lg text-text-secondary">
            Self-initiated systems built to explore production patterns — streaming
            AI copilots, conflict-free real-time collaboration, and cloud-native
            telemetry — each owned end-to-end, from architecture to deployment.
          </p>
        </header>

        {/* Filterable project grid (client island) */}
        <WorkFilter projects={projects} className="mt-16 lg:mt-20" />
      </div>
    </div>
  );
}
