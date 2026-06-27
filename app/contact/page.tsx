import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Let's build something — a full-stack web and mobile engineer open to React, Next.js, React Native, and Node.js roles.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div>
      <header className="section-pt">
        <div className="container-page">
          <div className="flex flex-col gap-5">
            <Eyebrow dot>Contact</Eyebrow>
            <h1 className="max-w-[20ch] font-display text-display-xl text-text text-balance">
              Let&apos;s build{" "}
              <span className="font-serif italic text-text-secondary">something</span>.
            </h1>
            <p className="max-w-[52ch] text-body-lg text-text-secondary">
              Open to full-stack web &amp; mobile engineering roles — React, Next.js,
              React Native, and Node.js. Tell me what you&apos;re building and
              I&apos;ll get back to you.
            </p>
          </div>
        </div>
      </header>

      <ContactCTA />
    </div>
  );
}
