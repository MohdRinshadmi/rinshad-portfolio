import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config/site";

/**
 * Root Open Graph / Twitter card. Matches the live brand — warm paper, ink
 * text, a single terracotta accent — so the shared card and the landing page
 * read as one thing. Satori (next/og) can't resolve Tailwind, so styles are
 * inline and use only its flexbox + gradient subset (NO grid).
 */

export const alt = `${siteConfig.fullName} — ${siteConfig.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const PAPER = "#f7f5f2";
  const INK = "#0a0a0a";
  const ACCENT = "#c75c37";
  const SECONDARY = "#6b6b66";
  const TERTIARY = "#8e8e88";
  const HAIRLINE = "rgba(10,10,10,0.12)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          backgroundImage:
            "radial-gradient(760px 520px at 16% 14%, rgba(199,92,55,0.14), transparent 62%), radial-gradient(640px 520px at 92% 90%, rgba(10,10,10,0.04), transparent 60%)",
          padding: "80px",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        {/* Top row — wordmark + live availability marker */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily:
                'ui-monospace, "SF Mono", "Menlo", "Consolas", monospace',
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: TERTIARY,
            }}
          >
            {siteConfig.name}
            <span style={{ color: ACCENT, marginLeft: 4 }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily:
                'ui-monospace, "SF Mono", "Menlo", "Consolas", monospace',
              fontSize: 20,
              letterSpacing: 2,
              color: SECONDARY,
            }}
          >
            <span
              style={{
                display: "flex",
                width: 12,
                height: 12,
                borderRadius: 999,
                background: ACCENT,
                marginRight: 14,
              }}
            />
            OPEN TO ROLES
          </div>
        </div>

        {/* Center block — name, accent rule, role */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 94,
              lineHeight: 1.0,
              fontWeight: 600,
              letterSpacing: "-0.035em",
              color: INK,
              maxWidth: 1000,
            }}
          >
            {siteConfig.fullName}
          </div>

          <div
            style={{
              display: "flex",
              width: 132,
              height: 5,
              borderRadius: 999,
              background: ACCENT,
              marginTop: 34,
              marginBottom: 34,
            }}
          />

          <div
            style={{
              display: "flex",
              fontSize: 38,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: SECONDARY,
              maxWidth: 920,
            }}
          >
            {siteConfig.role} · React · Next.js · React Native · Node.js · AWS
          </div>
        </div>

        {/* Bottom — one quiet proof line, hairline-topped */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingTop: 32,
            borderTop: `1px solid ${HAIRLINE}`,
            fontFamily:
              'ui-monospace, "SF Mono", "Menlo", "Consolas", monospace',
            fontSize: 24,
            letterSpacing: 1,
            color: TERTIARY,
          }}
        >
          <span
            style={{
              display: "flex",
              width: 26,
              height: 5,
              borderRadius: 999,
              background: ACCENT,
              marginRight: 16,
            }}
          />
          <span style={{ color: SECONDARY }}>2.5+ yrs</span>
          <span style={{ margin: "0 16px", color: TERTIARY }}>·</span>
          <span style={{ color: SECONDARY }}>20+ shipped</span>
          <span style={{ margin: "0 16px", color: TERTIARY }}>·</span>
          <span style={{ color: SECONDARY }}>Palakkad, India · Remote</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
