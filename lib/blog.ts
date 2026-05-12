import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPost } from "./types";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.(mdx?|md)$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug,
        title: data.title ?? slug,
        excerpt: data.excerpt ?? "",
        date: data.date ?? new Date().toISOString(),
        readTime: data.readTime ?? "5 min",
        tags: data.tags ?? [],
        coverImage: data.coverImage,
      } satisfies BlogPost;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string) {
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data, content };
}
