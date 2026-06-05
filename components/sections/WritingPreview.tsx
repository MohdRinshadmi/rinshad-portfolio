import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Chip } from "@/components/ui/Chip";
import { getAllPosts } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

/**
 * WritingPreview — quiet teaser for the three most recent posts.
 * Server component. Renders nothing when there are no posts.
 */
export function WritingPreview() {
  const posts = getAllPosts().slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section id="writing" className="section-py">
      <div className="container-page">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="WRITING"
            eyebrowPill
            title={
              <>
                Notes from the{" "}
                <span className="font-serif italic">build</span>
              </>
            }
            description="Field notes on streaming AI, real-time systems, and shipping production full-stack."
          />

          <Link
            href="/blog"
            className="group inline-flex shrink-0 items-center gap-1.5 font-mono text-sm text-text-secondary transition-colors hover:text-accent"
          >
            All writing
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border ring-hairline sm:mt-16 md:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug} className="bg-bg-subtle">
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col gap-4 bg-surface p-7 transition-colors duration-300 hover:bg-surface-raised focus-visible:outline-none"
              >
                <div className="flex items-center justify-between gap-3 font-mono text-xs text-text-tertiary">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span>{post.readTime}</span>
                </div>

                <h3 className="font-display text-h3 text-balance text-text transition-colors duration-300 group-hover:text-accent">
                  {post.title}
                </h3>

                {post.excerpt ? (
                  <p className="line-clamp-3 text-sm leading-relaxed text-text-secondary">
                    {post.excerpt}
                  </p>
                ) : null}

                {post.tags.length > 0 ? (
                  <div className="mt-auto flex flex-wrap gap-2 pt-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Chip key={tag} size="sm">
                        {tag}
                      </Chip>
                    ))}
                  </div>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
