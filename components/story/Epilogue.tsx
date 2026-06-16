import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { ScrubText } from "@/components/motion/ScrubText";
import { epilogue } from "@/lib/story";
import { siteConfig } from "@/lib/data";

/**
 * Epilogue — the documentary's ending, not a contact form. A closing statement
 * set large in serif, a quiet invitation, then four elegant hairline rows:
 * email, LinkedIn, GitHub, résumé.
 */
export function Epilogue() {
  const channels = [
    { label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { label: "LinkedIn", value: "in/mohd-rinshadmi", href: siteConfig.social.linkedin },
    { label: "GitHub", value: "@MohdRinshadmi", href: siteConfig.social.github },
    { label: "Résumé", value: "PDF · one page", href: siteConfig.resumeUrl },
  ];

  return (
    <section id="epilogue" className="relative section-py overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-aurora" />

      <div className="container-page">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <span className="font-grotesk text-eyebrow font-medium uppercase text-text-tertiary">
              Epilogue
            </span>
          </Reveal>

          <ScrubText
            as="h2"
            text={epilogue.statement}
            className="mt-8 text-center font-serif text-display-xl"
          />

          <Reveal className="mt-8 text-center" delay={0.1}>
            <p className="mx-auto max-w-[44ch] text-body-lg text-text-secondary">
              {epilogue.invitation}
            </p>
            <p className="mt-7 inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-text-tertiary">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-positive animate-pulse-dot" />
              {siteConfig.availability} · {siteConfig.responsePromise}
            </p>
          </Reveal>

          {/* ── Channels ────────────────────────────────────────────── */}
          <Reveal className="mt-16" delay={0.15}>
            <ul className="border-t border-border-strong">
              {channels.map((channel) => {
                const external = /^https?:/i.test(channel.href);
                return (
                  <li key={channel.label} className="border-b border-border">
                    <a
                      href={channel.href}
                      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="group flex items-baseline justify-between gap-6 py-6 transition-colors duration-200"
                    >
                      <span className="w-24 shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
                        {channel.label}
                      </span>
                      <span className="flex-1 truncate font-display text-h3 font-medium text-text transition-colors duration-200 group-hover:text-accent">
                        {channel.value}
                      </span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-5 shrink-0 self-center text-text-tertiary transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
