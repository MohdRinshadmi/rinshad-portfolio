import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/server/blog";
import { siteConfig } from "@/lib/config/site";
import { buildMetadata, graph, webPage, articleNode, breadcrumb } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";
import { Chip } from "@/components/ui/Chip";
import { JsonLd } from "@/components/seo/JsonLd";
import { mdxComponents } from "@/mdx-components";

/** Build a typed BlogPost from a slug's frontmatter (shared by metadata + JSON-LD). */
function toBlogPost(slug: string, fm: Record<string, unknown>): BlogPost {
  return {
    slug,
    title: typeof fm.title === "string" ? fm.title : slug,
    excerpt: typeof fm.excerpt === "string" ? fm.excerpt : "",
    date: typeof fm.date === "string" ? fm.date : new Date().toISOString(),
    readTime: typeof fm.readTime === "string" ? fm.readTime : "5 min",
    tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
    coverImage: typeof fm.coverImage === "string" ? fm.coverImage : undefined,
  };
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const exists = getAllPosts().some((post) => post.slug === slug);
  if (!exists) return buildMetadata({ title: "Writing", path: "/blog" });

  const { frontmatter } = getPostBySlug(slug);
  const post = toBlogPost(slug, frontmatter);
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.date,
    tags: post.tags,
  });
}

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;

  if (!getAllPosts().some((post) => post.slug === slug)) {
    notFound();
  }

  const { frontmatter, content } = getPostBySlug(slug);
  const post = toBlogPost(slug, frontmatter);

  const articleGraph = graph(
    webPage({
      path: `/blog/${slug}`,
      title: post.title,
      description: post.excerpt,
      mainEntityId: `${siteConfig.url}/blog/${slug}#article`,
      primaryImage: post.coverImage,
    }),
    articleNode(post),
    breadcrumb(
      [
        { name: "Home", path: "/" },
        { name: "Writing", path: "/blog" },
        { name: post.title, path: `/blog/${slug}` },
      ],
      `/blog/${slug}`,
    ),
  );

  return (
    <article className="section-pt pb-32">
      <JsonLd data={articleGraph} />

      <div className="container-page">
        <div className="mx-auto max-w-[68ch]">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-xs text-text-tertiary transition-colors hover:text-text"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            All writing
          </Link>

          {/* Frontmatter header */}
          <header className="mt-10">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-text-tertiary">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span aria-hidden className="text-text-muted">
                ·
              </span>
              <span>{post.readTime} read</span>
            </div>

            <h1 className="mt-5 font-display text-display-lg text-text">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-5 text-body-lg text-text-secondary">
                {post.excerpt}
              </p>
            )}

            {post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Chip key={tag} size="sm">
                    {tag}
                  </Chip>
                ))}
              </div>
            )}
          </header>

          <hr className="my-10 border-0 border-t border-border" />

          {/* Body */}
          <div className="max-w-[68ch]">
            <MDXRemote source={content} components={mdxComponents} />
          </div>
        </div>
      </div>
    </article>
  );
}
