import Link from "next/link";
import { GithubIcon, LinkedinIcon, TwitterXIcon } from "@/components/ui/SocialIcons";
import { siteConfig, socialLinks } from "@/lib/data";

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Github: GithubIcon,
  Linkedin: LinkedinIcon,
  Twitter: TwitterXIcon,
};

export function Footer() {
  return (
    <footer className="border-t border-white/6 bg-[#080808]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-sm font-semibold text-white">
              {siteConfig.name}
              <span className="text-violet-400">.</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} {siteConfig.fullName}. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((link) => {
              const Icon = iconMap[link.icon];
              return (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.name}
                  className="text-zinc-500 transition-colors hover:text-white"
                >
                  {Icon && <Icon className="h-4.5 w-4.5" />}
                </a>
              );
            })}
          </div>

          <nav className="flex gap-6">
            {["Projects", "Blog", "Contact"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
              >
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
