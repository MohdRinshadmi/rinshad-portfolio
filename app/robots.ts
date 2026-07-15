import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

/**
 * Robots policy. We *want* AI assistants to read and cite this site, so the
 * major LLM crawlers are allowed explicitly (GPTBot, ClaudeBot, Google-Extended,
 * PerplexityBot, etc.) alongside classic search engines. Only the API route is
 * withheld — nothing there is indexable content.
 */
export default function robots(): MetadataRoute.Robots {
  const aiAndSearchBots = [
    "*",
    "Googlebot",
    "Googlebot-Image",
    "Bingbot",
    "DuckDuckBot",
    "Google-Extended", // Gemini / Vertex training + grounding
    "GPTBot", // ChatGPT
    "OAI-SearchBot", // ChatGPT search
    "ChatGPT-User",
    "ClaudeBot", // Claude
    "Claude-Web",
    "anthropic-ai",
    "PerplexityBot", // Perplexity
    "Perplexity-User",
    "Applebot",
    "Applebot-Extended",
    "CCBot", // Common Crawl (feeds many models)
    "Bytespider",
    "Amazonbot",
    "cohere-ai",
  ];

  return {
    rules: aiAndSearchBots.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: "/api/",
    })),
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
