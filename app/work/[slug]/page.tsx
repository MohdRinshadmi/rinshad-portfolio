import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { getProject, projects } from "@/lib/content/projects";
import { siteConfig } from "@/lib/config/site";
import { buildMetadata, graph, webPage, projectNode, breadcrumb } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

import { CaseStudyHero } from "@/components/work/CaseStudyHero";
import { MetaRail } from "@/components/work/MetaRail";
import { CaseStudyBody } from "@/components/work/CaseStudyBody";
import { ContactCTA } from "@/components/contact/ContactCTA";

/* --------------------------------------------------------------------------
   Static generation + per-project metadata
   -------------------------------------------------------------------------- */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    return buildMetadata({ title: "Work", path: "/work" });
  }

  return buildMetadata({
    title: `${project.title} — Case Study`,
    description: project.card.purpose,
    path: `/work/${slug}`,
    type: "article",
    tags: project.tags,
  });
}

/* --------------------------------------------------------------------------
   Prev / Next pager
   -------------------------------------------------------------------------- */
function ProjectPager({ index }: { index: number }) {
  const total = projects.length;
  // With a single project, a pager would point to itself — skip it.
  if (total < 2) return null;

  const prev = projects[(index - 1 + total) % total];
  const next = projects[(index + 1) % total];

  return (
    <nav aria-label="More case studies" className="border-t border-border">
      <div className="container-page grid gap-px overflow-hidden sm:grid-cols-2">
        <Link
          href={`/work/${prev.slug}`}
          className="group flex min-h-28 flex-col justify-center gap-2 py-10 transition-colors sm:pr-8"
        >
          <span className="inline-flex items-center gap-2 font-mono text-eyebrow uppercase tracking-[0.14em] text-text-tertiary transition-colors group-hover:text-accent-text">
            <ArrowLeft aria-hidden="true" className="size-3.5 transition-transform duration-200 ease-out group-hover:-translate-x-1" />
            Previous
          </span>
          <span className="font-display text-h3 text-text-secondary transition-colors group-hover:text-text">
            {prev.title}
          </span>
        </Link>

        <Link
          href={`/work/${next.slug}`}
          className="group flex min-h-28 flex-col items-start justify-center gap-2 border-t border-border py-10 transition-colors sm:items-end sm:border-l sm:border-t-0 sm:pl-8 sm:text-right"
        >
          <span className="inline-flex items-center gap-2 font-mono text-eyebrow uppercase tracking-[0.14em] text-text-tertiary transition-colors group-hover:text-accent-text">
            Next
            <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-200 ease-out group-hover:translate-x-1" />
          </span>
          <span className="font-display text-h3 text-text-secondary transition-colors group-hover:text-text">
            {next.title}
          </span>
        </Link>
      </div>
    </nav>
  );
}

/* --------------------------------------------------------------------------
   Page
   -------------------------------------------------------------------------- */
export default async function CaseStudyPage({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);

  if (!project) {
    notFound();
  }

  const index = projects.findIndex((p) => p.slug === slug);

  // WebPage → the case study (SoftwareSourceCode/CreativeWork) → breadcrumb,
  // all cross-linked to the site-wide Person/WebSite graph by @id.
  const caseStudyGraph = graph(
    webPage({
      path: `/work/${slug}`,
      title: project.title,
      description: project.card.purpose,
      mainEntityId: `${siteConfig.url}/work/${slug}#project`,
      primaryImage: project.image,
    }),
    projectNode(project),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Work", path: "/work" },
        { name: project.title, path: `/work/${slug}` },
      ],
      `/work/${slug}`,
    ),
  );

  return (
    <div>
      <JsonLd data={caseStudyGraph} />

      <CaseStudyHero project={project} />

      <div className="container-page section-py">
        <div className="grid gap-12 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <MetaRail project={project} />
          <CaseStudyBody project={project} />
        </div>
      </div>

      <ProjectPager index={index} />

      <ContactCTA />
    </div>
  );
}
