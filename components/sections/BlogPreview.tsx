"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, Tag } from "lucide-react";
import { SectionWrapper, SectionHeading } from "@/components/animations/SectionWrapper";
import { StaggerChildren } from "@/components/animations/FadeUp";
import { fadeUp } from "@/lib/animation";
import type { BlogPost } from "@/lib/types";

const placeholderPosts: BlogPost[] = [
  {
    slug: "nextjs-performance-patterns",
    title: "Next.js Performance Patterns I Use in Every Production App",
    excerpt:
      "RSC, streaming, PPR, and a handful of lesser-known optimizations that push Lighthouse to 100 on real-world apps.",
    date: "2025-04-12",
    readTime: "8 min",
    tags: ["Next.js", "Performance"],
  },
  {
    slug: "system-design-saas",
    title: "How I Architect Multi-Tenant SaaS Backends",
    excerpt:
      "Schema-per-tenant vs. row-level security vs. separate DBs — the tradeoffs, benchmarks, and what I actually ship.",
    date: "2025-03-28",
    readTime: "12 min",
    tags: ["Architecture", "PostgreSQL"],
  },
  {
    slug: "dx-matters",
    title: "DX Is a Product Decision, Not a Nice-to-Have",
    excerpt:
      "Why investing in developer experience pays compounding returns — and the specific patterns that changed how my teams ship.",
    date: "2025-02-15",
    readTime: "6 min",
    tags: ["Engineering Culture", "DX"],
  },
];

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group relative flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm hover:border-violet-500/20 transition-all"
    >
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-300"
          >
            <Tag size={9} />
            {tag}
          </span>
        ))}
      </div>

      <h3 className="text-base font-bold leading-snug text-white group-hover:text-violet-200 transition-colors">
        {post.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400 flex-1">{post.excerpt}</p>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {post.readTime} read
          </span>
        </div>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
        >
          Read <ArrowUpRight size={12} />
        </Link>
      </div>
    </motion.article>
  );
}

export function BlogPreview() {
  return (
    <SectionWrapper id="blog" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between mb-16">
          <SectionHeading
            label="Writing"
            title="From the blog."
            description="Deep dives on engineering, architecture, and shipping products."
            className="mb-0"
          />
          <Link
            href="/blog"
            className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all sm:inline-flex"
          >
            All posts <ArrowUpRight size={14} />
          </Link>
        </div>

        <StaggerChildren className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {placeholderPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </StaggerChildren>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-white"
          >
            All posts <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
