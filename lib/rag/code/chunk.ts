import { createHash } from "node:crypto";
import type { CodeRepo } from "./repos.ts";

/* ============================================================================
   CHUNKER — one source file in, embeddable and citable pieces out.

   Line numbers are load-bearing: every citation the assistant shows links to
   `blob/<sha>/<path>#L<start>-L<end>`, so a range that is off by one sends a
   reader to the wrong lines of real code without anything looking broken.

   Code: 60-line windows overlapping by 10, ended early — by at most 20 lines —
   to land just before a top-level declaration or on a blank line, so a
   function is less often cut in half. Markdown: one piece per heading
   section, carrying its heading path, windowed the same way when it runs long.

   Every piece begins with `<repo>/<path> (lines a–b)`. The header is part of
   the embedded text, so a retrieved chunk still says where it came from.
   ========================================================================== */

export const CODE_WINDOW_LINES = 60;
export const CODE_OVERLAP_LINES = 10;
/** How far a window may end early to find a clean boundary. */
export const SNAP_LOOKBACK_LINES = 20;
/** gemini-embedding-001 reads up to 2,048 input tokens; 8,000 characters of
    code stays under that. A longer window is shortened, never truncated. */
export const MAX_CHUNK_CHARS = 8_000;

export interface LineRange {
  start: number;
  end: number;
}

export interface MarkdownSection extends LineRange {
  headingPath: string[];
}

export interface CodeChunk {
  id: string;
  repo: CodeRepo;
  path: string;
  startLine: number;
  endLine: number;
  /** Header, optional section path, a blank line, then the lines verbatim. */
  content: string;
  /** sha256 of `content` — what lets re-ingestion skip unchanged chunks. */
  contentHash: string;
}

export const chunkId = (repo: string, path: string, start: number, end: number) =>
  `${repo}/${path}#L${start}-L${end}`;

export const chunkHeader = (repo: string, path: string, start: number, end: number) =>
  `${repo}/${path} (lines ${start}–${end})`;

/** A line that opens a top-level declaration — column 0, no indentation. */
const DECLARATION =
  /^(?:export\s+(?:default\s+)?)?(?:(?:async\s+)?function\b|(?:abstract\s+)?class\b|interface\b|type\s+\w|enum\b|const\s+\w|let\s+\w|func\b|(?:async\s+)?def\b|struct\b|impl\b|model\b|@\w|CREATE\b|ALTER\b|FROM\b|[A-Za-z_][\w-]*:\s*(?:#.*)?$)/;

const HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/;
const FENCE = /^\s{0,3}(?:```|~~~)/;

const lineAt = (lines: readonly string[], n: number) => lines[n - 1] ?? "";

/** Overlapping windows over lines `first..last` (1-based, inclusive). */
export function windowRanges(lines: readonly string[], first = 1, last = lines.length): LineRange[] {
  const ranges: LineRange[] = [];
  let start = first;

  while (start <= last) {
    let end = Math.min(start + CODE_WINDOW_LINES - 1, last);
    // Absorb a leftover no bigger than the overlap rather than giving it a
    // window of its own that would be almost entirely repeated lines.
    end = last - end <= CODE_OVERLAP_LINES ? last : snapEnd(lines, start, end);
    end = fitEnd(lines, start, end);
    ranges.push({ start, end });
    if (end >= last) break;
    start = Math.max(end - CODE_OVERLAP_LINES + 1, start + 1);
  }

  return ranges;
}

function snapEnd(lines: readonly string[], start: number, end: number): number {
  const floor = Math.max(start + CODE_OVERLAP_LINES, end - SNAP_LOOKBACK_LINES);
  for (let e = end; e >= floor; e--) if (DECLARATION.test(lineAt(lines, e + 1))) return e;
  for (let e = end; e >= floor; e--) if (lineAt(lines, e).trim() === "") return e;
  return end;
}

function fitEnd(lines: readonly string[], start: number, end: number): number {
  let size = 0;
  for (let n = start; n <= end; n++) size += lineAt(lines, n).length + 1;
  while (end > start && size > MAX_CHUNK_CHARS) {
    size -= lineAt(lines, end).length + 1;
    end--;
  }
  return end;
}

/** Heading sections of a markdown file, ignoring `#` lines inside code fences. */
export function markdownSections(lines: readonly string[]): MarkdownSection[] {
  const sections: MarkdownSection[] = [];
  const stack: { level: number; title: string }[] = [];
  let start = 1;
  let headingPath: string[] = [];
  let inFence = false;

  lines.forEach((text, index) => {
    if (FENCE.test(text)) {
      inFence = !inFence;
      return;
    }
    const heading = inFence ? null : HEADING.exec(text);
    if (!heading) return;

    if (index >= start) sections.push({ start, end: index, headingPath });
    const level = heading[1].length;
    while (stack.length > 0 && stack[stack.length - 1].level >= level) stack.pop();
    stack.push({ level, title: heading[2] });
    start = index + 1;
    headingPath = stack.map((entry) => entry.title);
  });

  if (lines.length >= start) sections.push({ start, end: lines.length, headingPath });
  return sections;
}

function isHeadingOnly(lines: readonly string[], section: MarkdownSection): boolean {
  return (
    section.headingPath.length > 0 &&
    HEADING.test(lineAt(lines, section.start)) &&
    lines.slice(section.start, section.end).every((line) => line.trim() === "")
  );
}

function toLines(text: string): string[] {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/);
  if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export function chunkFile(repo: CodeRepo, path: string, text: string): CodeChunk[] {
  const lines = toLines(text);
  const pieces: MarkdownSection[] = path.toLowerCase().endsWith(".md")
    ? markdownSections(lines).flatMap((section) =>
        isHeadingOnly(lines, section)
          ? []
          : windowRanges(lines, section.start, section.end).map((range) => ({
              ...range,
              headingPath: section.headingPath,
            })),
      )
    : windowRanges(lines).map((range) => ({ ...range, headingPath: [] }));

  const chunks: CodeChunk[] = [];
  for (const { start, end, headingPath } of pieces) {
    const body = lines.slice(start - 1, end);
    if (body.every((line) => line.trim() === "")) continue;

    const content = [
      chunkHeader(repo, path, start, end),
      ...(headingPath.length > 0 ? [`Section: ${headingPath.join(" › ")}`] : []),
      "",
      ...body,
    ].join("\n");

    chunks.push({
      id: chunkId(repo, path, start, end),
      repo,
      path,
      startLine: start,
      endLine: end,
      content,
      contentHash: createHash("sha256").update(content).digest("hex"),
    });
  }
  return chunks;
}
