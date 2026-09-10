"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { X, ArrowUpRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, navLinks } from "@/lib/config/site";
import { EASE, DURATION } from "@/lib/animation";
import { useNavClick } from "@/lib/hooks/use-nav-click";
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

// With reduced motion, swap the y-transform variants for opacity-only.
const reduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The phone navigation overlay — a real modal dialog. On open, focus moves to
 * the close button and Tab cycles inside the menu; Escape or a tap on the
 * backdrop closes it, and focus returns to whatever opened it.
 */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const navClick = useNavClick();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  /* Close first, then let the shared handler decide: a different route
     navigates as usual, the current one glides to the top and replays. */
  const onNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    onClose();
    navClick(event, href);
  };

  // Focus management, Escape, and body scroll lock while open.
  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
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
      opener?.focus();
    };
  }, [open, onClose]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          ref={dialogRef}
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
              onClick={(event) => onNavClick(event, "/")}
              className="-ml-1 flex items-center rounded-md px-1 py-1 font-display text-lg font-semibold tracking-tight text-text"
              aria-label={`${siteConfig.name} — home`}
            >
              {siteConfig.name}
              <span className="ml-0.5 text-accent">.</span>
            </Link>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="-mr-1 inline-flex size-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-text"
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
                        onClick={(event) => onNavClick(event, link.href)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex items-baseline gap-3 py-1 font-display text-display-lg leading-none tracking-tight transition-colors",
                          active ? "text-text" : "text-text-secondary hover:text-text",
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

          {/* Bottom — primary CTA, résumé, socials */}
          <motion.div
            variants={reduceMotion ? reduced : footerItem}
            className="container-page shrink-0 space-y-5 border-t border-border py-8"
          >
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/contact"
                onClick={(event) => onNavClick(event, "/contact")}
                className="flex h-12 items-center justify-center rounded-full bg-text px-5 text-sm font-medium text-bg transition-colors hover:bg-accent"
              >
                Let&apos;s talk
              </Link>
              <a
                href={siteConfig.resumeUrl}
                download={siteConfig.resumeFileName}
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-border-strong px-5 text-sm font-medium text-text transition-colors hover:border-text/35"
              >
                Résumé
                <Download size={15} strokeWidth={1.75} aria-hidden="true" />
              </a>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <a
                  href={siteConfig.social.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub (opens in a new tab)"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-strong hover:text-text"
                >
                  <GithubIcon className="size-5" />
                </a>
                <a
                  href={siteConfig.social.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn (opens in a new tab)"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:border-border-strong hover:text-text"
                >
                  <LinkedinIcon className="size-5" />
                </a>
              </div>

              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex min-h-11 items-center gap-1.5 font-mono text-xs text-text-secondary transition-colors hover:text-text"
              >
                {siteConfig.email}
                <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
