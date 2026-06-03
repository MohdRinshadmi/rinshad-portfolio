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
