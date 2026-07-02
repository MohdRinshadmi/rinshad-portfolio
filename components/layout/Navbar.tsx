"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Menu, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, navLinks } from "@/lib/config/site";
import { EASE, DURATION } from "@/lib/animation";

/* Lazy chunk: the overlay + its framer exit choreography only download on the
   first tap of the hamburger, not with every page's shell. */
const MobileMenu = dynamic(
  () => import("./MobileMenu").then((mod) => ({ default: mod.MobileMenu })),
  { ssr: false },
);

/** Staggered entrance for the bar's three groups (wordmark · nav · actions). */
const barContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const barItem: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE.out } },
};

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Latches true on first open so the lazy menu stays mounted afterwards
  // (AnimatePresence needs the mount to run its exit animation).
  const [menuMounted, setMenuMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // The highlight pill rests on the active link, and follows the cursor on hover.
  const activeHref = navLinks.find((l) => isActive(l.href))?.href ?? null;
  const highlight = hovered ?? activeHref;

  return (
    <>
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base, ease: EASE.out }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 ease-out",
          scrolled ? "border-b-transparent" : "border-dashed border-border-strong",
        )}
      >
        <motion.div
          variants={reduceMotion ? undefined : barContainer}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
          className={cn(
            "mx-auto flex items-center justify-between gap-4 border ease-[cubic-bezier(0.16,1,0.3,1)]",
            "transition-[max-width,height,padding,border-radius,border-color,background-color,box-shadow,margin] duration-500",
            scrolled
              ? "mt-3 h-14 max-w-3xl rounded-full border-border bg-surface/80 pl-5 pr-3 shadow-[0_10px_40px_-18px_rgba(20,18,14,0.45)] backdrop-blur-xl"
              : "mt-0 h-16 max-w-300 rounded-none border-transparent bg-transparent px-6 lg:px-12",
          )}
        >
          {/* Wordmark */}
          <motion.div variants={reduceMotion ? undefined : barItem}>
            <Link
              href="/"
              className="group/word -ml-1 flex items-center rounded-md px-1 py-1 font-display text-lg font-semibold tracking-tight text-text"
              aria-label={`${siteConfig.name} — home`}
            >
              <span className="transition-opacity duration-200 group-hover/word:opacity-70">
                {siteConfig.name}
              </span>
              <span className="ml-0.5 inline-block text-accent transition-transform duration-300 ease-out group-hover/word:scale-[1.45]">
                .
              </span>
            </Link>
          </motion.div>

          {/* Desktop nav — hover-follow highlight pill */}
          <motion.nav
            variants={reduceMotion ? undefined : barItem}
            onMouseLeave={() => setHovered(null)}
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const lit = highlight === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHovered(link.href)}
                  onFocus={() => setHovered(link.href)}
                  onBlur={() => setHovered(null)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ease-out",
                    active || lit ? "text-text" : "text-text-secondary",
                  )}
                >
                  {lit && (
                    <motion.span
                      layoutId={reduceMotion ? undefined : "nav-highlight"}
                      className={cn(
                        "absolute inset-0 -z-10 rounded-full bg-text/[0.05] ring-1 ring-inset ring-border",
                        active && "bg-accent/[0.08] ring-accent/20",
                      )}
                      transition={
                        reduceMotion
                          ? undefined
                          : { type: "spring", stiffness: 420, damping: 34 }
                      }
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </motion.nav>

          <motion.div
            variants={reduceMotion ? undefined : barItem}
            className="flex items-center gap-2"
          >
            {/* Let's talk pill (primary CTA) */}
            <Link
              href="/contact"
              className={cn(
                "group/cta hidden items-center gap-1.5 rounded-full bg-text py-2 pl-5 pr-4 text-sm font-medium text-bg shadow-card md:inline-flex",
                "transition-[transform,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-accent",
              )}
            >
              Let&apos;s talk
              <ArrowUpRight
                size={15}
                strokeWidth={2}
                aria-hidden="true"
                className="transition-transform duration-200 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
              />
            </Link>

            {/* Hamburger (mobile) */}
            <button
              type="button"
              onClick={() => {
                setMenuMounted(true);
                setMenuOpen(true);
              }}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="-mr-1 inline-flex h-11 w-11 items-center justify-center rounded-md text-text-secondary transition-colors hover:text-text md:hidden"
            >
              <Menu size={22} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>
      </motion.header>

      {menuMounted && <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />}
    </>
  );
}
