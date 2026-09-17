import { describe, expect, it } from "vitest";
import { MAX_CHARS_PER_SECOND, MIN_CHARS_PER_SECOND, revealBoundary, revealRate } from "./reveal";

describe("revealRate", () => {
  it("never drops below a reading pace", () => {
    expect(revealRate(3, false)).toBe(MIN_CHARS_PER_SECOND);
  });

  it("speeds up with the backlog, and more so once the answer is complete", () => {
    expect(revealRate(600, false)).toBe(500);
    expect(revealRate(300, true)).toBe(500);
    expect(revealRate(600, true)).toBeGreaterThan(revealRate(600, false));
  });

  it("is capped", () => {
    expect(revealRate(100_000, true)).toBe(MAX_CHARS_PER_SECOND);
  });
});

describe("revealBoundary", () => {
  const text = "Rinshad builds APIs [cite:faq/stack] daily";

  it("cuts only at whitespace", () => {
    expect(text.slice(0, revealBoundary(text, 10))).toBe("Rinshad");
    expect(text.slice(0, revealBoundary(text, 16))).toBe("Rinshad builds");
  });

  it("never shows a half-arrived citation marker", () => {
    const inMarker = text.indexOf("stack");
    expect(text.slice(0, revealBoundary(text, inMarker))).toBe("Rinshad builds APIs");
  });

  it("shows everything once the reveal passes the end", () => {
    expect(revealBoundary(text, text.length)).toBe(text.length);
    expect(revealBoundary(text, text.length + 50)).toBe(text.length);
  });

  it("shows nothing inside the first word", () => {
    expect(revealBoundary(text, 3)).toBe(0);
    expect(revealBoundary("", 0)).toBe(0);
  });
});
