import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactCTA } from "@/components/contact/ContactCTA";
import { buildMetadata, graph, webPage, breadcrumb } from "@/lib/seo";
import { siteConfig } from "@/lib/config/site";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Contact Mohammed Rinshad, Full-Stack Software Engineer in India — open to backend and full-stack roles, remote or relocation. Email, LinkedIn, GitHub, résumé.",
  path: "/contact",
});

const contactGraph = graph(
  webPage({
    path: "/contact",
    title: `Contact ${siteConfig.fullName}`,
    description:
      "Hire a full-stack software engineer — Node.js, Express.js, TypeScript, Python, PostgreSQL, Redis, Docker, and AWS, with React, Next.js, and React Native on the client. Open to roles across India and worldwide.",
    type: "ContactPage",
    mainEntityId: `${siteConfig.url}/#person`,
  }),
  breadcrumb(
    [
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
    ],
    "/contact",
  ),
);

export default function ContactPage() {
  return (
    <div>
      <JsonLd data={contactGraph} />
      <header className="section-pt">
        <div className="container-page">
          <div className="flex flex-col gap-5">
            <Eyebrow dot>Contact</Eyebrow>
            <h1 className="max-w-[20ch] font-display text-display-xl text-text text-balance">
              Let&apos;s build{" "}
              <span className="font-serif italic text-text-secondary">something</span>.
            </h1>
            <p className="max-w-[52ch] text-body-lg text-text-secondary">
              Open to backend and full-stack engineering roles — Node.js,
              Express.js, and TypeScript on MySQL, PostgreSQL, Redis, Docker and
              AWS, with React, Next.js and React Native on the client. Tell me
              what you&apos;re building and I&apos;ll get back to you.
            </p>
          </div>
        </div>
      </header>

      <ContactCTA />
    </div>
  );
}
