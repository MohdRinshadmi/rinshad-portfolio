import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config/site";

/**
 * Root Open Graph card. Satori (next/og) cannot resolve Tailwind utilities, so
 * styles are inline and use only the flexbox + CSS subset it supports — NO grid.
 * Palette mirrors the design tokens: ink #08080A canvas, Electric Indigo #6e56f7
 * accent (used only for the rule + a single chromatic note), near-monochrome text.
 */

export const alt = `${siteConfig.fullName} — ${siteConfig.role}`;

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

export default async function Image() {
  const INK = "#08080A";
  const ACCENT = "#6E56F7";
  const TEXT = "#FAFAF9";
  const SECONDARY = "#A1A1AA";
  const TERTIARY = "#71717A";
  const HAIRLINE = "rgba(255,255,255,0.10)";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: INK,
          // Subtle aurora wash — supported radial gradients, transform/opacity-free.
          backgroundImage:
            "radial-gradient(900px 600px at 18% 12%, rgba(110,86,247,0.20), transparent 60%), radial-gradient(700px 600px at 92% 88%, rgba(56,40,180,0.16), transparent 60%)",
          padding: "80px",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        {/* Top row — eyebrow label + live availability marker */}
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
              fontSize: 96,
              lineHeight: 1.0,
              fontWeight: 600,
              letterSpacing: "-0.035em",
              color: TEXT,
              maxWidth: 1000,
            }}
          >
            {siteConfig.fullName}
          </div>

          {/* The single accent rule */}
          <div
            style={{
              display: "flex",
              width: 132,
              height: 4,
              borderRadius: 999,
              background: ACCENT,
              marginTop: 36,
              marginBottom: 36,
            }}
          />

          <div
            style={{
              display: "flex",
              fontSize: 38,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              color: SECONDARY,
              maxWidth: 900,
            }}
          >
            {siteConfig.role}
          </div>
        </div>

        {/* Bottom — one stat line, quiet mono, hairline-topped */}
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
          <span style={{ color: ACCENT, marginRight: 12 }}>▸</span>
          <span style={{ color: SECONDARY }}>2.5+ yrs</span>
          <span style={{ margin: "0 16px", color: TERTIARY }}>·</span>
          <span style={{ color: SECONDARY }}>20+ shipped</span>
          <span style={{ margin: "0 16px", color: TERTIARY }}>·</span>
          <span style={{ color: SECONDARY }}>Web · APIs · Cloud</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
