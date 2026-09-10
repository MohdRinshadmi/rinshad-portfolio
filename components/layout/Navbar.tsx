"use client";

import { useState, useEffect, type CSSProperties } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig, navLinks } from "@/lib/config/site";
import { useNavClick } from "@/lib/hooks/use-nav-click";

/* Lazy chunk: the overlay + its framer exit choreography only download on the
   first tap of the hamburger, not with every page's shell. */
const MobileMenu = dynamic(
  () => import("./MobileMenu").then((mod) => ({ default: mod.MobileMenu })),
  { ssr: false },
);

/** Stagger for the CSS entrance (`.nav-drop` in globals.css). */
const at = (seconds: number) => ({ "--hero-delay": `${seconds}s` }) as CSSProperties;

/**
 * The site header. Résumé and "Let's talk" are one click from every page —
 * on phones too, where the résumé stays in the bar as a pill beside the menu.
 *
 * The entrance is CSS rather than Framer: an `initial={{ opacity: 0 }}` renders
 * into the server HTML, which left the site's primary actions invisible until
 * React had hydrated.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Latches true on first open so the lazy menu stays mounted afterwards
  // (AnimatePresence needs the mount to run its exit animation).
  const [menuMounted, setMenuMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  // A tab always means "start of this page" — including the tab you're on.
  const onNavClick = useNavClick();

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
      <header
        className={cn(
          "nav-drop fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 ease-out",
          scrolled ? "border-b-transparent" : "border-dashed border-border-strong",
        )}
      >
        <div
          className={cn(
            "mx-auto flex items-center justify-between gap-3 border ease-[cubic-bezier(0.16,1,0.3,1)]",
            "transition-[max-width,height,padding,border-radius,border-color,background-color,box-shadow,margin] duration-500",
            scrolled
              ? "mt-3 h-14 max-w-3xl rounded-full border-border bg-surface/80 pl-5 pr-2 shadow-[0_10px_40px_-18px_rgba(20,18,14,0.45)] backdrop-blur-xl sm:pr-3"
              : "mt-0 h-16 max-w-300 rounded-none border-transparent bg-transparent px-5 sm:px-6 lg:px-12",
          )}
        >
          {/* Wordmark */}
          <div className="nav-drop" style={at(0.12)}>
            <Link
              href="/"
              onClick={(event) => onNavClick(event, "/")}
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
          </div>

          {/* Desktop nav — hover-follow highlight pill */}
          <nav
            onMouseLeave={() => setHovered(null)}
            className="nav-drop hidden items-center gap-0.5 md:flex"
            style={at(0.19)}
            aria-label="Primary"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const lit = highlight === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(event) => onNavClick(event, link.href)}
                  onMouseEnter={() => setHovered(link.href)}
                  onFocus={() => setHovered(link.href)}
                  onBlur={() => setHovered(null)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ease-out lg:px-4",
                    active || lit ? "text-text" : "text-text-secondary",
                  )}
                >
                  {lit && (
                    <motion.span
                      layoutId={reduceMotion ? undefined : "nav-highlight"}
                      className={cn(
                        "absolute inset-0 -z-10 rounded-full bg-text/5 ring-1 ring-inset ring-border",
                        active && "bg-accent/8 ring-accent/20",
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
          </nav>

          <div className="nav-drop flex items-center gap-1.5 md:gap-2" style={at(0.26)}>
            {/* Résumé — the action most visitors came for. A bordered pill on
                phones (it is the only action left in the bar there), a quiet
                text link beside the primary CTA on wider screens. */}
            <a
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-1 rounded-full border border-border-strong px-4 text-sm font-medium text-text transition-colors duration-200 hover:border-text/35 md:h-9 md:border-transparent md:px-3 md:text-text-secondary md:hover:border-transparent md:hover:text-text"
            >
              Résumé
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
              <span className="sr-only"> (PDF, opens in a new tab)</span>
            </a>

            {/* Let's talk pill (primary CTA) */}
            <Link
              href="/contact"
              onClick={(event) => onNavClick(event, "/contact")}
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
              aria-haspopup="dialog"
              className="-mr-1 inline-flex size-11 items-center justify-center rounded-full text-text-secondary transition-colors hover:text-text md:hidden"
            >
              <Menu size={22} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {menuMounted && <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />}
    </>
  );
}
