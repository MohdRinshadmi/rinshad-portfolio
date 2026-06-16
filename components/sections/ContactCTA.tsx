import { Mail, Phone, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { ContactForm } from "@/components/sections/ContactForm";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollScale } from "@/components/motion/ScrollScale";
import { siteConfig } from "@/lib/data";

interface InfoRow {
  key: string;
  label: string;
  value: string;
  href?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const infoRows: InfoRow[] = [
  {
    key: "email",
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
  },
  {
    key: "phone",
    label: "Phone",
    value: siteConfig.phone,
    href: `tel:${siteConfig.phone.replace(/\s+/g, "")}`,
    icon: Phone,
  },
  {
    key: "location",
    label: "Location",
    value: siteConfig.location,
    icon: MapPin,
  },
];

export function ContactCTA() {
  return (
    <section id="contact" className="section-py">
      <div className="container-page">
        <Reveal className="flex flex-col gap-5">
          <Eyebrow pill>CONTACT</Eyebrow>
          <h2 className="max-w-[18ch] font-display text-display-lg text-text text-balance sm:text-display-xl">
            Have something worth building?{" "}
            <span className="font-serif italic text-text-secondary">Let&apos;s talk.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:mt-16 lg:grid-cols-[15rem_minmax(0,34rem)] lg:gap-12">
          {/* Left info rail */}
          <div className="flex flex-col gap-8">
            <ul className="flex flex-col gap-6">
              {infoRows.map(({ key, label, value, href, icon: Icon }, i) => (
                <Reveal as="li" key={key} delay={i * 0.08} y={16} className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface ring-hairline"
                  >
                    <Icon size={18} className="text-text-secondary" />
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-mono text-eyebrow uppercase text-text-tertiary">
                      {label}
                    </span>
                    {href ? (
                      <a
                        href={href}
                        className="text-sm font-medium text-text transition-colors hover:text-accent"
                      >
                        {value}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-text">{value}</span>
                    )}
                  </span>
                </Reveal>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary ring-hairline transition-colors hover:border-accent/40 hover:text-text"
              >
                <GithubIcon className="size-4" />
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary ring-hairline transition-colors hover:border-accent/40 hover:text-text"
              >
                <LinkedinIcon className="size-4" />
              </a>
            </div>

            <div className="mt-auto flex flex-col gap-3 rounded-2xl border border-border bg-surface/60 p-6 ring-hairline">
              <Badge live tone="positive">
                {siteConfig.availability}
              </Badge>
              <p className="text-sm text-text-secondary">{siteConfig.responsePromise}.</p>
            </div>
          </div>

          {/* Right form — settles into place as it reaches the reading zone. */}
          <ScrollScale from={0.97} y={32}>
            <ContactForm />
          </ScrollScale>
        </div>
      </div>
    </section>
  );
}
