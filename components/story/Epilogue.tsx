import { ArrowUpRight, Download } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { ScrubText } from "@/components/motion/ScrubText";
import { epilogue } from "@/lib/content/story";
import { siteConfig } from "@/lib/config/site";

interface Channel {
  label: string;
  value: string;
  href: string;
  external?: boolean;
  download?: string;
}

const ROW =
  "grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 py-5 sm:grid-cols-[7rem_1fr_auto] sm:py-6";
const LABEL = "font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary";
const VALUE =
  "col-start-1 min-w-0 break-words font-display text-xl font-medium text-text sm:col-start-2 sm:row-start-1 sm:text-h3";
const TRAILING = "col-start-2 row-span-2 row-start-1 sm:col-start-3 sm:row-span-1";

/**
 * Epilogue — the ending, and the homepage's contact section. A direct line to
 * whoever is hiring, availability and relocation in one sentence, then a row
 * per channel plus where (and in which time zone) I am.
 *
 * On phones each row stacks its label above the value, so an email address is
 * never truncated to "rinshad803@gm…".
 */
export function Epilogue() {
  const channels: Channel[] = [
    { label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { label: "LinkedIn", value: "in/mohd-rinshadmi", href: siteConfig.social.linkedin, external: true },
    { label: "GitHub", value: "@MohdRinshadmi", href: siteConfig.social.github, external: true },
    {
      label: "Résumé",
      value: "Download PDF · 2 pages",
      href: siteConfig.resumeUrl,
      download: siteConfig.resumeFileName,
    },
  ];

  return (
    <section id="contact" className="relative section-py overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-aurora" />

      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <span className="font-grotesk text-eyebrow font-medium uppercase text-text-tertiary">
              {epilogue.eyebrow}
            </span>
          </Reveal>

          <ScrubText
            as="h2"
            text={epilogue.statement}
            className="mt-8 text-balance text-center font-serif text-display-xl"
          />

          <Reveal className="mt-8 text-center" delay={0.1}>
            <p className="mx-auto max-w-[50ch] text-body-lg text-text-secondary">{epilogue.invitation}</p>
            <p className="mt-7 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-text-tertiary">
              {/* Inline, not a flex item, so a wrapped line never strands the dot on its own. */}
              <span
                aria-hidden="true"
                className="mr-2.5 inline-block size-1.5 rounded-full bg-positive align-middle animate-pulse-dot"
              />
              {siteConfig.availability} · {siteConfig.responsePromise}
            </p>
          </Reveal>

          <Reveal className="mt-14 sm:mt-16" delay={0.15}>
            <ul className="border-t border-border-strong">
              {channels.map((channel) => (
                <li key={channel.label} className="border-b border-border">
                  <a
                    href={channel.href}
                    {...(channel.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    {...(channel.download ? { download: channel.download } : {})}
                    className={`group ${ROW}`}
                  >
                    <span className={LABEL}>{channel.label}</span>
                    <span className={`${VALUE} transition-colors duration-200 group-hover:text-accent-text`}>
                      {channel.value}
                    </span>
                    {channel.download ? (
                      <Download
                        aria-hidden="true"
                        className={`${TRAILING} size-5 text-text-tertiary transition-[transform,color] duration-200 group-hover:translate-y-0.5 group-hover:text-accent`}
                      />
                    ) : (
                      <ArrowUpRight
                        aria-hidden="true"
                        className={`${TRAILING} size-5 text-text-tertiary transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent`}
                      />
                    )}
                    {channel.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                  </a>
                </li>
              ))}
              <li className={`border-b border-border ${ROW}`}>
                <span className={LABEL}>Based in</span>
                <span className={VALUE}>{siteConfig.location}</span>
                <span className={`${TRAILING} font-mono text-xs text-text-tertiary`}>{siteConfig.timezone}</span>
              </li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
