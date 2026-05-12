import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
