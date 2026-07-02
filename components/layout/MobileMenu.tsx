"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, navLinks } from "@/lib/config/site";
import { EASE, DURATION } from "@/lib/animation";
import { GithubIcon, LinkedinIcon } from "@/components/ui/SocialIcons";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

const overlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.base, ease: EASE.out, staggerChildren: 0.06, delayChildren: 0.08 },
  },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE.out } },
};

const linkItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.reveal, ease: EASE.emphasis } },
  exit: { opacity: 0, y: 12, transition: { duration: DURATION.fast, ease: EASE.out } },
};

const footerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE.out } },
  exit: { opacity: 0, transition: { duration: DURATION.fast, ease: EASE.out } },
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  // Close on Escape + lock body scroll while open.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open, onClose]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // With reduced motion, swap the y-transform variants for opacity-only.
  const reduced: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          variants={overlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[60] flex flex-col bg-bg/95 backdrop-blur-xl md:hidden"
        >
          {/* Top bar — wordmark + close */}
          <div className="container-page flex h-16 shrink-0 items-center justify-between">
            <Link
              href="/"
              onClick={onClose}
              className="-ml-1 flex items-center rounded-md px-1 py-1 font-display text-lg font-semibold tracking-tight text-text"
              aria-label={`${siteConfig.name} — home`}
            >
              {siteConfig.name}
              <span className="ml-0.5 text-accent">.</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="-mr-1 inline-flex h-11 w-11 items-center justify-center rounded-md text-text-secondary transition-colors hover:text-text"
            >
              <X size={22} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          {/* Oversized nav links */}
          <nav
            className="container-page flex flex-1 flex-col justify-center"
            aria-label="Primary mobile"
          >
            <ul className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href} className="overflow-hidden">
                    <motion.div variants={reduceMotion ? reduced : linkItem}>
                      <Link
                        href={link.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex items-baseline gap-3 py-1 font-display text-display-lg leading-none tracking-tight transition-colors",
                          active ? "text-text" : "text-text-secondary hover:text-text"
                        )}
                      >
                        <span>{link.label}</span>
                        {active && (
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 translate-y-[-0.15em] rounded-full bg-accent"
                          />
                        )}
                      </Link>
                    </motion.div>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom — socials, résumé, primary CTA */}
          <motion.div
            variants={reduceMotion ? reduced : footerItem}
            className="container-page shrink-0 space-y-5 border-t border-border py-8"
          >
            <Link
              href="/contact"
              onClick={onClose}
              className="flex h-12 w-full items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-accent-fg shadow-glow transition-colors hover:bg-accent-hover"
            >
              Let&apos;s talk
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-strong hover:text-text"
                >
                  <GithubIcon className="h-5 w-5" />
                </a>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-strong hover:text-text"
                >
                  <LinkedinIcon className="h-5 w-5" />
                </a>
              </div>

              <a
                href={siteConfig.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-2 font-mono text-eyebrow uppercase text-text-secondary transition-colors hover:text-text"
              >
                Résumé
                <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
