import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading the dev server from these LAN origins (e.g. testing on a phone
  // at http://192.168.12.28:3000). Update if your machine's local IP changes.
  allowedDevOrigins: ["192.168.12.28"],
  experimental: {
    mdxRs: true,
  },
  turbopack: {
    root: __dirname,
  },
  images: {
    // Local project mockups are SVGs; allow the optimizer to serve them.
    // Safe here because every SVG under /public is authored in-repo (no scripts).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

export default nextConfig;
