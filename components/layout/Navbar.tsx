"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/data";

const navLinks = [
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#blog", label: "Blog" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/[0.06] bg-[#080808]/80 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-70"
        >
          {siteConfig.name}
          <span className="text-violet-400">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={siteConfig.resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            Resume
          </a>
        </nav>

        <button
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-white/[0.06] bg-[#080808]/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={siteConfig.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 w-fit rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white"
              >
                Resume
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
