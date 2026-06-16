/* ============================================================================
   3D PALETTE — the design tokens from globals.css, mirrored as numeric colors
   for three.js materials/shaders. One source of visual truth: ink stages,
   cream text, a single ember accent. Never introduce a new hue in a scene.
   ========================================================================== */

export const INK = {
  /** stage background (= --color-ink) */
  bg: 0x0d0d0f,
  /** raised panels inside a stage (= --color-ink-raised) */
  raised: 0x17171a,
  /** fog — slightly warmer than bg so depth reads as atmosphere, not black */
  fog: 0x0e0d0e,
} as const;

export const EMBER = {
  base: 0xe5502a,
  hover: 0xf25c34,
  /** dimmed ember for lines/edges that should glow but not shout */
  dim: 0x8a3019,
} as const;

export const CREAM = {
  base: 0xfafaf9,
  secondary: 0xa1a1aa,
  tertiary: 0x71717a,
} as const;

/** CSS strings for DOM fallbacks that must match scene colors exactly. */
export const CSS = {
  ember: "#e5502a",
  cream: "#fafaf9",
  inkBg: "#0d0d0f",
} as const;
