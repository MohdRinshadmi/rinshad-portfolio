import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  CODE_OVERLAP_LINES,
  CODE_WINDOW_LINES,
  MAX_CHUNK_CHARS,
  chunkFile,
  chunkHeader,
  markdownSections,
  windowRanges,
} from "./chunk";

/* ============================================================================
   CHUNKER — every citation links to `#L<start>-L<end>`, so these ranges are
   pinned exactly. An off-by-one would send a reader to the wrong lines.
   ========================================================================== */

/** `n` indented lines: nothing blank and no top-level declaration to snap to. */
const plain = (n: number) => Array.from({ length: n }, (_, i) => `  value_${i + 1} += 1;`);
/** A code chunk's lines, after its header and the blank line. */
const bodyOf = (content: string) => content.split("\n").slice(2);

describe("code windows", () => {
  it("covers a file in 60-line windows overlapping by 10", () => {
    expect(windowRanges(plain(150))).toEqual([
      { start: 1, end: 60 },
      { start: 51, end: 110 },
      { start: 101, end: 150 },
    ]);
  });

  it("overlaps every consecutive pair by exactly 10 lines", () => {
    const ranges = windowRanges(plain(400));
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i - 1].end - ranges[i].start + 1).toBe(CODE_OVERLAP_LINES);
    }
    for (const range of ranges.slice(0, -1)) expect(range.end - range.start + 1).toBe(CODE_WINDOW_LINES);
    expect(ranges[ranges.length - 1].end).toBe(400);
  });

  it("keeps a short file whole and never leaves a sliver of 10 lines or fewer", () => {
    expect(windowRanges(plain(30))).toEqual([{ start: 1, end: 30 }]);
    expect(windowRanges(plain(70))).toEqual([{ start: 1, end: 70 }]);
    expect(windowRanges(plain(71))).toEqual([
      { start: 1, end: 60 },
      { start: 51, end: 71 },
    ]);
  });

  it("ends a window just before a top-level declaration within reach", () => {
    const lines = plain(120);
    lines[54] = "export function refreshAccessToken() {"; // line 55
    expect(windowRanges(lines)).toEqual([
      { start: 1, end: 54 },
      { start: 45, end: 104 },
      { start: 95, end: 120 },
    ]);
  });

  it("falls back to a blank line when there is no declaration", () => {
    const lines = plain(120);
    lines[49] = ""; // line 50
    expect(windowRanges(lines)).toEqual([
      { start: 1, end: 50 },
      { start: 41, end: 100 },
      { start: 91, end: 120 },
    ]);
  });

  it("never reaches back more than 20 lines to snap", () => {
    const lines = plain(120);
    lines[29] = "func main() {"; // line 30 — too early to use
    expect(windowRanges(lines)[0]).toEqual({ start: 1, end: 60 });
  });

  it("shortens windows of very long lines under the size cap without dropping any line", () => {
    const lines = Array.from({ length: 90 }, (_, i) => `  ${"x".repeat(398)}${i}`);
    const ranges = windowRanges(lines);
    const covered = new Set<number>();

    for (const { start, end } of ranges) {
      const size = lines.slice(start - 1, end).reduce((total, line) => total + line.length + 1, 0);
      expect(size).toBeLessThanOrEqual(MAX_CHUNK_CHARS);
      for (let n = start; n <= end; n++) covered.add(n);
    }
    expect(covered.size).toBe(90);
    expect(ranges[0].end).toBeLessThan(CODE_WINDOW_LINES);
  });
});

describe("chunkFile", () => {
  const repo = "ai-life-assistant" as const;

  it("starts every chunk with its `<repo>/<path> (lines a–b)` header, then the exact lines", () => {
    const lines = plain(130);
    const chunks = chunkFile(repo, "apps/server/src/auth.ts", `${lines.join("\n")}\n`);

    expect(chunks.map((c) => [c.startLine, c.endLine])).toEqual([
      [1, 60],
      [51, 110],
      [101, 130],
    ]);
    for (const chunk of chunks) {
      const where = `lines ${chunk.startLine}–${chunk.endLine}`;
      expect(chunk.content.split("\n")[0]).toBe(`ai-life-assistant/apps/server/src/auth.ts (${where})`);
      expect(bodyOf(chunk.content), where).toEqual(lines.slice(chunk.startLine - 1, chunk.endLine));
      expect(chunk.id).toBe(`ai-life-assistant/apps/server/src/auth.ts#L${chunk.startLine}-L${chunk.endLine}`);
      expect(chunk.contentHash).toBe(createHash("sha256").update(chunk.content).digest("hex"));
    }
  });

  it("uses an en dash in the header range", () => {
    expect(chunkHeader("r", "p.ts", 42, 101)).toBe("r/p.ts (lines 42–101)");
  });

  it("re-hashes only the chunks whose lines changed", () => {
    const before = plain(130);
    const after = [...before];
    after[4] = "  value_5 -= 1;";

    const a = chunkFile(repo, "x.ts", before.join("\n"));
    const b = chunkFile(repo, "x.ts", after.join("\n"));

    expect(b.map((c) => c.id)).toEqual(a.map((c) => c.id));
    expect(b.map((c, i) => c.contentHash === a[i].contentHash)).toEqual([false, true, true]);
  });

  it("handles a BOM, CRLF and a trailing newline without inventing lines", () => {
    const [chunk] = chunkFile(repo, "a.py", "﻿def a():\r\n    return 1\r\n");
    expect([chunk.startLine, chunk.endLine]).toEqual([1, 2]);
    expect(bodyOf(chunk.content)).toEqual(["def a():", "    return 1"]);
  });

  it("indexes nothing for a blank file", () => {
    expect(chunkFile(repo, "empty.ts", "\n\n  \n")).toEqual([]);
  });
});

describe("markdown", () => {
  const doc = [
    "Intro line",
    "",
    "# Title",
    "Para",
    "## Setup",
    "Install",
    "### Env",
    "Set vars",
    "```sh",
    "## not a heading",
    "```",
    "## Usage",
    "Run it",
  ];

  it("splits on headings outside code fences and tracks the heading path", () => {
    expect(markdownSections(doc)).toEqual([
      { start: 1, end: 2, headingPath: [] },
      { start: 3, end: 4, headingPath: ["Title"] },
      { start: 5, end: 6, headingPath: ["Title", "Setup"] },
      { start: 7, end: 11, headingPath: ["Title", "Setup", "Env"] },
      { start: 12, end: 13, headingPath: ["Title", "Usage"] },
    ]);
  });

  it("puts the heading path straight after the header", () => {
    const chunks = chunkFile("ai-real-time-collaboration", "docs/guide.md", doc.join("\n"));
    const env = chunks.find((c) => c.startLine === 7);

    expect(env?.content.split("\n").slice(0, 3)).toEqual([
      "ai-real-time-collaboration/docs/guide.md (lines 7–11)",
      "Section: Title › Setup › Env",
      "",
    ]);
    // The preamble has no heading, so no section line.
    expect(chunks[0].content.split("\n")[1]).toBe("");
  });

  it("skips a heading with nothing under it", () => {
    const chunks = chunkFile("ai-life-assistant", "README.md", "# A\n## B\nText");
    expect(chunks.map((c) => [c.startLine, c.endLine])).toEqual([[2, 3]]);
  });

  it("windows a long section and keeps its heading path on every piece", () => {
    const chunks = chunkFile("ai-life-assistant", "docs/long.md", ["# Deep", ...plain(130)].join("\n"));
    expect(chunks.length).toBeGreaterThan(1);
    for (const chunk of chunks) expect(chunk.content.split("\n")[1]).toBe("Section: Deep");
  });
});
