import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { Chip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Eyebrow";

export const metadata: Metadata = buildMetadata({
  title: "Writing",
  description:
    "Field notes on AI-native interfaces, real-time systems, and shipping fast production-grade React, Next.js, and Node.js.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="section-pt pb-32">
      <div className="container-page">
        {/* Header */}
        <header className="max-w-[68ch]">
          <Eyebrow dot>Writing</Eyebrow>
          <h1 className="mt-5 font-display text-display-xl text-text">
            Notes from the{" "}
            <span className="font-serif italic text-text-secondary">build log</span>
          </h1>
          <p className="mt-6 text-body-lg text-text-secondary">
            Essays and field notes on AI-native interfaces, real-time systems, and
            the engineering patterns I reach for to ship fast without cutting
            corners.
          </p>
        </header>

        {/* List */}
        {posts.length === 0 ? (
          <p className="mt-20 font-mono text-sm text-text-tertiary">
            No posts yet — writing in progress.
          </p>
        ) : (
          <ul className="mt-16 border-t border-border">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group grid gap-4 border-b border-border py-8 transition-colors hover:bg-surface/40 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8 sm:px-4 sm:[margin-inline:-1rem]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-text-tertiary">
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                      <span aria-hidden className="text-text-muted">
                        ·
                      </span>
                      <span>{post.readTime} read</span>
                    </div>

                    <h2 className="mt-3 font-display text-h3 text-text transition-colors group-hover:text-accent-hover">
                      {post.title}
                    </h2>

                    <p className="mt-2 max-w-[60ch] text-text-secondary">
                      {post.excerpt}
                    </p>

                    {post.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Chip key={tag} size="sm">
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </div>

                  <span
                    aria-hidden
                    className="hidden items-center gap-1.5 self-center font-mono text-xs text-text-tertiary transition-colors group-hover:text-accent sm:inline-flex"
                  >
                    Read
                    <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
