import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";
import { cn } from "@/lib/utils";

/**
 * Styled MDX component map — renders post bodies in the design tokens with
 * prose-like rhythm. Used by `app/blog/[slug]/page.tsx` via <MDXRemote /> and
 * exposed to the App Router through `useMDXComponents`.
 *
 * Heading note: the page already owns the single <h1> (frontmatter title), so a
 * stray `# Heading` inside the body is rendered as a styled <h2> to keep heading
 * order valid (one <h1> per page).
 */

type HeadingProps = ComponentPropsWithoutRef<"h2">;
type ParagraphProps = ComponentPropsWithoutRef<"p">;
type ListProps = ComponentPropsWithoutRef<"ul">;
type OrderedListProps = ComponentPropsWithoutRef<"ol">;
type ListItemProps = ComponentPropsWithoutRef<"li">;
type AnchorProps = ComponentPropsWithoutRef<"a">;
type CodeProps = ComponentPropsWithoutRef<"code">;
type PreProps = ComponentPropsWithoutRef<"pre">;
type QuoteProps = ComponentPropsWithoutRef<"blockquote">;
type HrProps = ComponentPropsWithoutRef<"hr">;
type StrongProps = ComponentPropsWithoutRef<"strong">;

export const mdxComponents = {
  h1: ({ className, ...props }: HeadingProps) => (
    <h2
      className={cn(
        "mt-16 mb-5 scroll-mt-28 font-display text-h2 text-text first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }: HeadingProps) => (
    <h2
      className={cn(
        "mt-16 mb-5 scroll-mt-28 font-display text-h2 text-text first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }: HeadingProps) => (
    <h3
      className={cn(
        "mt-12 mb-4 scroll-mt-28 font-display text-h3 text-text",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }: HeadingProps) => (
    <h4
      className={cn(
        "mt-10 mb-3 scroll-mt-28 font-display text-lg font-medium text-text",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }: ParagraphProps) => (
    <p
      className={cn("my-6 text-body-lg text-text-secondary", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }: ListProps) => (
    <ul
      className={cn(
        "my-6 ml-1 list-none space-y-3 text-body-lg text-text-secondary",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: OrderedListProps) => (
    <ol
      className={cn(
        "my-6 ml-5 list-decimal space-y-3 marker:font-mono marker:text-text-tertiary text-body-lg text-text-secondary",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, children, ...props }: ListItemProps) => (
    <li
      className={cn(
        "relative pl-6 leading-relaxed",
        "before:absolute before:left-0 before:top-[0.72em] before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:bg-accent/60",
        "in-[ol]:pl-1 in-[ol]:before:hidden",
        className,
      )}
      {...props}
    >
      {children}
    </li>
  ),
  a: ({ className, href = "", children, ...props }: AnchorProps) => {
    const isExternal = /^https?:/.test(href);
    const classes = cn(
      "font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:text-accent-hover hover:decoration-accent/60",
      className,
    );
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={classes}
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  },
  strong: ({ className, ...props }: StrongProps) => (
    <strong className={cn("font-semibold text-text", className)} {...props} />
  ),
  code: ({ className, ...props }: CodeProps) => (
    <code
      className={cn(
        // Inline code only — block code is unstyled here so <pre> owns its look.
        "rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.85em] text-text in-[pre]:border-0 in-[pre]:bg-transparent in-[pre]:p-0 in-[pre]:text-text-secondary",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: PreProps) => (
    <pre
      className={cn(
        "my-8 overflow-x-auto rounded-xl border border-border bg-surface p-5 ring-hairline",
        "font-mono text-sm leading-relaxed text-text-secondary",
        className,
      )}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }: QuoteProps) => (
    <blockquote
      className={cn(
        "my-8 border-l-2 border-accent/40 pl-6 font-serif text-xl italic text-text",
        className,
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }: HrProps) => (
    <hr className={cn("my-12 border-0 border-t border-border", className)} {...props} />
  ),
};

/**
 * App Router MDX hook — merges any caller-provided components over the styled map.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components, ...mdxComponents };
}
