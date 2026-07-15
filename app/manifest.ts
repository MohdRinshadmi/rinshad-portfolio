import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

/**
 * Web App Manifest — installable presentation + richer mobile/search surfaces.
 * theme/background mirror the design tokens (terracotta accent on warm paper).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.fullName} — ${siteConfig.role}`,
    short_name: siteConfig.name,
    description: siteConfig.tagline,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f5f2",
    theme_color: "#c75c37",
    lang: "en-IN",
    dir: "ltr",
    categories: ["portfolio", "technology", "business"],
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
