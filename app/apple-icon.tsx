import { ImageResponse } from "next/og";

/**
 * Apple touch icon (home-screen). iOS masks the corners itself, so we render a
 * full-bleed terracotta field with the brand monogram — no rounded rect here.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#c75c37",
          position: "relative",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        <span
          style={{
            fontSize: 118,
            fontWeight: 700,
            letterSpacing: "-4px",
            color: "#f7f5f2",
            lineHeight: 1,
          }}
        >
          R
        </span>
        <span
          style={{
            position: "absolute",
            right: 40,
            bottom: 46,
            width: 14,
            height: 14,
            borderRadius: 999,
            background: "#f7f5f2",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
