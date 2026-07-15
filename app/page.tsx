import { Prologue } from "@/components/story/Prologue";
import { BehindTheInterfaces } from "@/components/story/BehindTheInterfaces";
import { SystemsCanvas } from "@/components/story/SystemsCanvas";
import { WorkStories } from "@/components/story/WorkStories";
import { Principles } from "@/components/story/Principles";
import { FAQ } from "@/components/story/FAQ";
import { Epilogue } from "@/components/story/Epilogue";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPage, faqPage } from "@/lib/seo";
import { faqs } from "@/lib/content/faq";
import { siteConfig } from "@/lib/config/site";

/**
 * Homepage — "an engineering documentary" in five chapters.
 * Prologue (the statement + living artifact) → The Builder → Behind the
 * Interfaces (horizontal case study) → Systems Thinking (drawn architecture)
 * → Selected Work (magazine features) → Principles → Epilogue (the ending).
 * The Builder closes on the full-bleed proof band (count-up stats).
 */
/** The homepage is the canonical ProfilePage for the Person entity, and it
    carries the FAQPage. Both reference the site-wide graph by @id. */
const homeGraph = graph(
  webPage({
    path: "/",
    title: `${siteConfig.fullName} — ${siteConfig.role}`,
    description: siteConfig.bio,
    type: "ProfilePage",
    hasBreadcrumb: false,
    mainEntityId: `${siteConfig.url}/#person`,
    primaryImage: siteConfig.portrait.src,
  }),
  faqPage(faqs, "/"),
);

export default function Home() {
  return (
    <>
      <JsonLd data={homeGraph} />
      <Prologue />
      {/* Parked chapter — re-import TheBuilder from @/components/story/TheBuilder to re-enable.
      <TheBuilder /> */}
      <BehindTheInterfaces />
      <SystemsCanvas />
      <WorkStories />
      <Principles />
      <FAQ />
      <Epilogue />
    </>
  );
}
