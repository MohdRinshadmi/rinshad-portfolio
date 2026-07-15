import { siteConfig } from "@/lib/config/site";
import { getAllPosts } from "@/lib/server/blog";

const BASE = siteConfig.url;

/** Minimal XML entity escaping for text nodes / CDATA-free fields. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * RSS 2.0 feed for the writing/blog. Lets readers and aggregators (and some AI
 * research crawlers) subscribe, and is advertised via the layout's
 * `alternates.types` link. Statically generated with the rest of the site.
 */
export async function GET() {
  const posts = getAllPosts();
  const updated = posts[0]?.date
    ? new Date(posts[0].date).toUTCString()
    : new Date(0).toUTCString();

  const items = posts
    .map((post) => {
      const url = `${BASE}/blog/${post.slug}`;
      const pubDate = post.date ? new Date(post.date).toUTCString() : updated;
      const categories = post.tags
        .map((tag) => `<category>${esc(tag)}</category>`)
        .join("");
      return `    <item>
      <title>${esc(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(post.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${esc(siteConfig.fullName)}</dc:creator>
      ${categories}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(siteConfig.fullName)} — Writing</title>
    <link>${BASE}/blog</link>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Field notes on full-stack web and mobile engineering — React, Next.js, React Native, Node.js, AI/LLM, and real-time systems.</description>
    <language>en-IN</language>
    <lastBuildDate>${updated}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
