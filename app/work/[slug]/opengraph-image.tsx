import { ImageResponse } from "next/og";
import { getProject, projects } from "@/lib/content/projects";
import { siteConfig } from "@/lib/config/site";

/**
 * Per-case-study Open Graph card. Each shared /work/[slug] link gets its own
 * branded image built from the project's real title, tagline, platform, and
 * top tags — far higher social/AI-preview CTR than one generic card.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const alt = "Case study";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);

  const PAPER = "#f7f5f2";
  const INK = "#0a0a0a";
  const ACCENT = "#c75c37";
  const SECONDARY = "#6b6b66";
  const TERTIARY = "#8e8e88";
  const HAIRLINE = "rgba(10,10,10,0.12)";

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: PAPER,
            color: INK,
            fontSize: 56,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {siteConfig.fullName}
        </div>
      ),
      { ...size },
    );
  }

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
            "radial-gradient(760px 520px at 14% 12%, rgba(199,92,55,0.14), transparent 62%), radial-gradient(640px 520px at 94% 92%, rgba(10,10,10,0.04), transparent 60%)",
          padding: "80px",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        {/* Top — platform eyebrow + wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: 'ui-monospace, "SF Mono", "Menlo", monospace',
            fontSize: 21,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: ACCENT }}>{project.platform}</span>
          <span style={{ color: TERTIARY, letterSpacing: 6 }}>
            {siteConfig.name}
            <span style={{ color: ACCENT }}>.</span>
          </span>
        </div>

        {/* Center — title + tagline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: "-0.03em",
              color: INK,
              maxWidth: 1040,
            }}
          >
            {project.title}
          </div>
          <div
            style={{
              display: "flex",
              width: 120,
              height: 5,
              borderRadius: 999,
              background: ACCENT,
              marginTop: 30,
              marginBottom: 30,
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 34,
              lineHeight: 1.28,
              letterSpacing: "-0.01em",
              color: SECONDARY,
              maxWidth: 960,
            }}
          >
            {project.tagline}
          </div>
        </div>

        {/* Bottom — top tags */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            paddingTop: 30,
            borderTop: `1px solid ${HAIRLINE}`,
            fontFamily: 'ui-monospace, "SF Mono", "Menlo", monospace',
            fontSize: 22,
            color: SECONDARY,
          }}
        >
          {project.tags.slice(0, 5).map((tag, i) => (
            <div key={tag} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 ? (
                <span style={{ color: TERTIARY, margin: "0 14px" }}>·</span>
              ) : null}
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
