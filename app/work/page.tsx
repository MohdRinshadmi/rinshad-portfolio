import type { Metadata } from "next";

import { projects, workDisclaimer } from "@/lib/content/projects";
import { siteConfig } from "@/lib/config/site";
import { buildMetadata, graph, webPage, breadcrumb } from "@/lib/seo";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { WorkFilter } from "@/components/work/WorkFilter";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Work",
  description:
    "Selected backend and full-stack work — Node.js, TypeScript, and Golang services spanning REST APIs, RAG pipelines, and distributed real-time systems, each self-hosted on PostgreSQL, Redis, and Docker.",
  path: "/work",
});

const workGraph = graph(
  webPage({
    path: "/work",
    title: "Selected Work — Backend, Distributed Systems & AI Projects",
    description:
      "Case studies of backend systems built by Mohammed Rinshad — a Golang Clean-Architecture telemetry platform, a streaming Node.js AI API with pgvector RAG, and a stateless WebSocket fan-out server on Redis Pub/Sub.",
    type: "CollectionPage",
  }),
  breadcrumb(
    [
      { name: "Home", path: "/" },
      { name: "Work", path: "/work" },
    ],
    "/work",
  ),
  {
    "@type": "ItemList",
    "@id": `${siteConfig.url}/work#projects`,
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteConfig.url}/work/${p.slug}`,
      name: p.title,
    })),
  },
);

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
      <JsonLd data={workGraph} />
      <div className="container-page">
        {/* Lite header */}
        <header className="max-w-3xl">
          <Eyebrow dot>Selected Work</Eyebrow>

          <h1 className="mt-5 font-display text-display-xl text-text text-balance">
            Backend systems, built end to end.
          </h1>

          <p className="mt-6 max-w-[58ch] text-body-lg text-text-secondary">
            Three self-directed services, each taken from schema to deployment: a
            Golang telemetry backend on Clean Architecture, a streaming Node.js API
            with Python ingestion and pgvector retrieval, and a stateless WebSocket
            tier that scales without sticky sessions.
          </p>

          {/* The résumé's own disclaimer, kept visible — it is what makes every
              claim on these case studies credible. */}
          <p className="mt-6 max-w-[58ch] border-l border-border pl-4 font-mono text-xs leading-relaxed text-text-tertiary">
            {workDisclaimer}
          </p>
        </header>

        {/* Filterable project grid (client island) */}
        <WorkFilter projects={projects} className="mt-16 lg:mt-20" />
      </div>
    </div>
  );
}
