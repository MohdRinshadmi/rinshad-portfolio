import { describe, expect, it } from "vitest";
import { cn, formatDate } from "./utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });

  it("accepts conditional objects and arrays", () => {
    expect(cn(["a", "b"], { c: true, d: false })).toBe("a b c");
  });

  it("lets a later Tailwind class win over an earlier conflicting one", () => {
    // This is the whole reason cn exists rather than a plain join — component
    // props must be able to override base classes.
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-text", "text-accent")).toBe("text-accent");
  });

  it("keeps classes from different property groups", () => {
    expect(cn("px-2 py-1", "text-sm")).toBe("px-2 py-1 text-sm");
  });

  it("returns an empty string for no input", () => {
    expect(cn()).toBe("");
  });
});

describe("formatDate", () => {
  it("formats an ISO date string", () => {
    expect(formatDate("2026-04-12T00:00:00Z")).toBe("Apr 12, 2026");
  });

  it("formats a Date object", () => {
    expect(formatDate(new Date("2025-12-01T00:00:00Z"))).toBe("Dec 1, 2025");
  });

  it("is stable across calls (the formatter is hoisted and reused)", () => {
    const first = formatDate("2026-01-31T00:00:00Z");
    expect(formatDate("2026-01-31T00:00:00Z")).toBe(first);
  });
});
