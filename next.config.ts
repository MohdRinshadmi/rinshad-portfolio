import type { NextConfig } from "next";

/* ============================================================================
   SECURITY HEADERS
   The site is entirely self-contained: no third-party scripts, no iframes, no
   service worker, and exactly one same-origin fetch (POST /api/contact). That
   lets every fetch directive lock down to 'self'.

   script-src keeps 'unsafe-inline' on purpose. Next's App Router streams the
   RSC payload through ~31 inline <script>self.__next_f.push(...)</script> tags;
   without 'unsafe-inline' the page never hydrates. The only strict alternative
   Next 16 offers is a per-request nonce, which requires dynamic rendering and
   would drop every route from static to server-rendered (see docs/SECURITY.md).
   Everything an inline-script CSP cannot cover is still locked down here:
   object-src, base-uri, form-action and frame-ancestors close the injection
   vectors that 'unsafe-inline' leaves open.
   ========================================================================== */
/* `next dev` needs two relaxations the production policy must never carry:
   React evaluates code with eval() for its dev-only debugging features (it
   throws outright without 'unsafe-eval'), and Fast Refresh talks to the dev
   server over a websocket. Without these the dev server still serves HTML, but
   React never hydrates — so every Framer Motion `initial={{ opacity: 0 }}`
   element stays invisible and most of the page renders blank. */
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  // See note above — Next's streaming hydration payload is inline.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  // Framer Motion writes inline style attributes on every animated element.
  "style-src 'self' 'unsafe-inline'",
  // data: for the blur/SVG placeholders the image optimizer inlines.
  "img-src 'self' data: blob:",
  "font-src 'self'",
  // ws: is Fast Refresh's channel in dev; production talks to nothing but itself.
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "manifest-src 'self'",
  "media-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // Would rewrite http://localhost to https:// in dev; production only.
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Not set: `require-trusted-types-for 'script'`. Measured 2026-08-28 in
  // report-only mode — 51 violations across 7 routes, every one of them from
  // Turbopack's own chunk loader assigning HTMLScriptElement.src (zero from
  // app code). Next 16 exposes no Trusted Types policy option and its runtime
  // never references `trustedTypes`, so enforcing it would break lazy chunk
  // loading site-wide. Revisit when Next ships TT support.
  // Two years, subdomains included, and preload-list eligible. Note this is a
  // hard commitment: every current and future subdomain must serve HTTPS.
  // Omitted in dev: localhost is plain http, and pinning HSTS for `localhost`
  // would force every other local project on http://localhost to https.
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
  // Clickjacking: frame-ancestors above is the modern control; XFO covers
  // browsers that predate it. Both say the same thing on purpose.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deliberately NOT set: Cross-Origin-Opener-Policy: same-origin. Measured
  // 2026-08-28 as the single most expensive header here — it puts the document
  // in its own browsing-context group, so Chrome allocates a fresh renderer
  // process per navigation. Isolated A/B (median of 5, prod build over h2):
  //   every other header, no COOP -> perf 96, LCP 2702ms, TBT 2
  //   COOP alone                  -> perf 94, LCP 3078ms, TBT 13
  // COOP guards cross-window attacks (XS-Leaks, window.opener abuse). This site
  // has no auth, no session, no window.open and no cross-origin popups, so it
  // buys nothing here. Add it back the moment this site gains a login, or if it
  // ever needs crossOriginIsolated (SharedArrayBuffer) — and re-measure.
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  // Nothing here uses these capabilities; deny them rather than leave defaults.
  {
    key: "Permissions-Policy",
    value: "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  // Allow loading the dev server from these LAN origins (e.g. testing on a phone
  // at http://192.168.12.28:3000). Update if your machine's local IP changes.
  allowedDevOrigins: ["192.168.12.28"],
  turbopack: {
    root: __dirname,
  },
  images: {
    // AVIF first, WebP fallback (Next's default is ["image/webp"] alone).
    // The optimizer content-negotiates, so non-AVIF browsers still get WebP.
    formats: ["image/avif", "image/webp"],
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
  async headers() {
    return [
      // Document-level policy. Deliberately NOT applied to /_next/static or
      // /_next/image: CSP, COOP, Permissions-Policy and friends only mean
      // anything on an HTML document, and this block is ~1 KB — repeating it
      // across ~30 asset responses measurably delayed FCP/LCP for no benefit.
      {
        source: "/((?!_next/static|_next/image).*)",
        headers: securityHeaders,
      },
      // Immutable build assets only need MIME-sniffing protection.
      {
        source: "/_next/:path*",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
  },
};

export default nextConfig;
