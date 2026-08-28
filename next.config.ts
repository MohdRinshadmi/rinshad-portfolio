import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow loading the dev server from these LAN origins (e.g. testing on a phone
  // at http://192.168.12.28:3000). Update if your machine's local IP changes.
  allowedDevOrigins: ["192.168.12.28"],
  turbopack: {
    root: __dirname,
  },
  images: {
    // Next 16 only allows quality=75 unless listed; 90 keeps UI screenshots
    // (fine text on dark gradients) crisp where they're cropped/enlarged.
    qualities: [75, 90],
    // Local project mockups are SVGs; allow the optimizer to serve them.
    // Safe here because every SVG under /public is authored in-repo (no scripts).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // No remote images: every still is served from /public. If you ever add
    // one, list the exact hostname — a "**" pattern lets anyone proxy
    // arbitrary images through the optimizer on this domain's dime.
    remotePatterns: [],
  },
};

export default nextConfig;
