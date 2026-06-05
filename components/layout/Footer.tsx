import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { navLinks, siteConfig } from "@/lib/data";

const socials = [
  { name: "GitHub", href: siteConfig.social.github, Icon: GithubIcon },
  { name: "LinkedIn", href: siteConfig.social.linkedin, Icon: LinkedinIcon },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-page py-16 lg:py-20">
        {/* Top: wordmark + availability ── nav + connect */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5">
            <Link
              href="/"
              aria-label="Rinshad — home"
              className="group inline-flex w-fit items-end gap-1.5"
            >
              <span className="font-display text-display-lg leading-none tracking-tight text-text">
                Rinshad
              </span>
              <span
                aria-hidden="true"
                className="mb-1.5 size-2.5 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125"
              />
            </Link>
            <p className="max-w-[42ch] text-body-lg text-text-secondary">
              {siteConfig.tagline}
            </p>
            <Badge live tone="positive" className="w-fit">
              {siteConfig.availability}
            </Badge>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16 lg:gap-24">
            <nav aria-label="Footer">
              <h2 className="mb-4 font-mono text-eyebrow uppercase text-text-tertiary">
                Navigate
              </h2>
              <ul className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-11 items-center text-text-secondary transition-colors duration-200 hover:text-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="mb-4 font-mono text-eyebrow uppercase text-text-tertiary">
                Connect
              </h2>
              <div className="flex flex-col gap-5">
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="inline-flex w-fit font-mono text-sm text-text-secondary underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline"
                >
                  {siteConfig.email}
                </a>
                <ul className="flex items-center gap-2">
                  {socials.map(({ name, href, Icon }) => (
                    <li key={name}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={name}
                        className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-surface/60 text-text-secondary transition-colors duration-200 hover:border-accent/40 hover:text-text"
                      >
                        <Icon className="size-4.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: sign-off + copyright */}
        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between lg:mt-20">
          <p className="font-mono text-xs text-text-tertiary">
            Designed &amp; built in Kerala. Next.js · Tailwind · Framer Motion.
          </p>
          <p className="font-mono text-xs text-text-muted">
            © {year} {siteConfig.fullName}
          </p>
        </div>
      </div>
    </footer>
  );
}
