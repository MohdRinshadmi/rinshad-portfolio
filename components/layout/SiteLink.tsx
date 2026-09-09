"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useNavClick } from "@/lib/hooks/use-nav-click";

/**
 * A `next/link` that honours the site's "a nav link always starts at the top"
 * rule — including when it points at the route you are already reading, which
 * the router treats as a no-op. Used for footer navigation; the header wires
 * `useNavClick` directly because its links already carry their own handlers.
 */
export function SiteLink({
  href,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { href: string }) {
  const navClick = useNavClick();

  return (
    <Link
      href={href}
      onClick={(event) => {
        onClick?.(event);
        navClick(event, href);
      }}
      {...props}
    />
  );
}
