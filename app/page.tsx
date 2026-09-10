import { Prologue } from "@/components/story/Prologue";
import { ProofStrip } from "@/components/story/ProofStrip";
import { InProduction } from "@/components/story/InProduction";
import { BehindTheInterfaces } from "@/components/story/BehindTheInterfaces";
import { WorkStories } from "@/components/story/WorkStories";
import { HowIBuild } from "@/components/story/HowIBuild";
import { Principles } from "@/components/story/Principles";
import { FAQ } from "@/components/story/FAQ";
import { Epilogue } from "@/components/story/Epilogue";
import { JsonLd } from "@/components/seo/JsonLd";
import { graph, webPage, faqPage } from "@/lib/seo";
import { faqs } from "@/lib/content/faq";
import { siteConfig } from "@/lib/config/site";

/**
 * Homepage — an engineering documentary, ordered for a fifteen-second read.
 *
 * Cover (who · what · stack · three actions) → proof strip → 01 In Production
 * (experience) → 02 Behind the Interfaces (one production system, end to end)
 * → 03 Selected Work → 04 How I build production systems (architecture and
 * skills) → 05 Principles → FAQ → Epilogue (contact).
 */
/** The homepage is the canonical ProfilePage for the Person entity, and it
    carries the FAQPage. Both reference the site-wide graph by @id. */
const homeGraph = graph(
  webPage({
    path: "/",
    title: `${siteConfig.fullName} — ${siteConfig.role}`,
    description: siteConfig.description,
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
      <ProofStrip />
      <InProduction />
      <BehindTheInterfaces />
      <WorkStories />
      <HowIBuild />
      <Principles />
      <FAQ />
      <Epilogue />
    </>
  );
}
