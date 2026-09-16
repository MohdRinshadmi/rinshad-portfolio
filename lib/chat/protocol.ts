/* ============================================================================
   CHAT WIRE PROTOCOL — the one contract /api/chat and the widget share.

   The response body is NDJSON: one JSON frame per line. Frames rather than
   plain text because a chat stream carries more than tokens — where the
   answer came from, how it ended, and why it failed — and the widget's state
   machine is driven by those frames, not by guessing from a closed socket.

     {"type":"token","text":"…"}                     a slice of the answer
     {"type":"source","id":"…","title":"…","url":"…"} a citation resolved on the server
     {"type":"tool","name":"searchCode","status":"running","query":"…"}
     {"type":"tool","name":"searchCode","status":"done","results":8}
                                                      a code search, before and after
     {"type":"done"}                                  the answer is complete
     {"type":"error","code":"…"}                      the answer failed

   Dependency-free on purpose: it ships in the widget's lazy chunk, and it is
   pure so the tricky parts (lines split across network chunks, markers still
   streaming in) are unit-tested without a browser.
   ========================================================================== */

/* ----------------------------------------------------------------------------
   Limits — enforced by the route, respected by the widget before it sends.
   -------------------------------------------------------------------------- */

/** The question being asked. */
export const MAX_QUESTION_CHARS = 1000;
/** Ten turns: ten questions and the ten answers between them. */
export const MAX_MESSAGES = 20;
/** Any single message in the history. A 1,024-token answer is ~4–5k characters. */
export const MAX_MESSAGE_CHARS = 8000;
/** The whole history, so a long conversation can't quietly multiply the bill. */
export const MAX_HISTORY_CHARS = 24_000;

export type WireRole = "user" | "assistant";

export interface WireMessage {
  role: WireRole;
  content: string;
}

/* ----------------------------------------------------------------------------
   Frames
   -------------------------------------------------------------------------- */

export const SERVER_ERROR_CODES = [
  "bad_request",
  "invalid_request",
  "rate_limited",
  "unavailable",
  "quota",
  "upstream",
] as const;

export type ServerErrorCode = (typeof SERVER_ERROR_CODES)[number];

export interface Source {
  id: string;
  title: string;
  url: string;
}

/** The server running a tool mid-answer. Phase B has one: searchCode. An
    `error` status means the tool failed; the answer itself carries on. */
export type ToolFrame =
  | { type: "tool"; name: string; status: "running"; query: string; repo?: string }
  | { type: "tool"; name: string; status: "done"; results: number }
  | { type: "tool"; name: string; status: "error" };

export type Frame =
  | { type: "token"; text: string }
  | ({ type: "source" } & Source)
  | ToolFrame
  | { type: "done" }
  | { type: "error"; code: ServerErrorCode };

export const NDJSON_CONTENT_TYPE = "application/x-ndjson; charset=utf-8";

export function encodeFrame(frame: Frame): string {
  return `${JSON.stringify(frame)}\n`;
}

/** A line that is not a frame at all — a bug or a proxy's error page, never a user error. */
export class ProtocolError extends Error {
  name = "ProtocolError";
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Parse one NDJSON line. Returns `null` for a well-formed frame of a type this
 * client doesn't know, so a server that has learned a new frame type can't
 * break a widget that hasn't.
 */
export function parseFrame(line: string): Frame | null {
  let value: unknown;
  try {
    value = JSON.parse(line);
  } catch {
    throw new ProtocolError("Response line is not valid JSON");
  }
  if (!isRecord(value) || typeof value.type !== "string") {
    throw new ProtocolError("Response line is not a frame");
  }

  switch (value.type) {
    case "token":
      if (typeof value.text === "string") return { type: "token", text: value.text };
      break;
    case "source":
      if (
        typeof value.id === "string" &&
        typeof value.title === "string" &&
        typeof value.url === "string"
      ) {
        return { type: "source", id: value.id, title: value.title, url: value.url };
      }
      break;
    case "tool": {
      if (typeof value.name !== "string") break;
      if (value.status === "running" && typeof value.query === "string") {
        return {
          type: "tool",
          name: value.name,
          status: "running",
          query: value.query,
          ...(typeof value.repo === "string" ? { repo: value.repo } : {}),
        };
      }
      if (value.status === "done" && typeof value.results === "number") {
        return { type: "tool", name: value.name, status: "done", results: value.results };
      }
      if (value.status === "error") return { type: "tool", name: value.name, status: "error" };
      break;
    }
    case "done":
      return { type: "done" };
    case "error": {
      const code = SERVER_ERROR_CODES.find((known) => known === value.code);
      return { type: "error", code: code ?? "upstream" };
    }
    default:
      return null;
  }

  throw new ProtocolError(`Malformed "${value.type}" frame`);
}

/**
 * Turns a byte stream into frames. A network chunk is NOT a frame: one read
 * can end halfway through a JSON line, or halfway through a multi-byte
 * character. Complete lines are parsed; the tail waits for the next chunk.
 */
export function createFrameDecoder() {
  const decoder = new TextDecoder();
  let buffer = "";

  const parseLines = (lines: string[]) => {
    const frames: Frame[] = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      const frame = parseFrame(line);
      if (frame) frames.push(frame);
    }
    return frames;
  };

  return {
    push(chunk: Uint8Array): Frame[] {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      return parseLines(lines);
    },
    /** Call once the stream ends: parses a final line that had no newline. */
    flush(): Frame[] {
      buffer += decoder.decode();
      const rest = buffer;
      buffer = "";
      return parseLines([rest]);
    },
  };
}

/* ----------------------------------------------------------------------------
   Citations — `[cite:project/ai-life-assistant]`
   -------------------------------------------------------------------------- */

/** A corpus chunk id: lowercase kebab segments joined by `/`. */
export const CITATION_ID = /^[a-z0-9]+(?:[/-][a-z0-9]+)*$/;

const MARKER = /\[cite:([^\]\n]{0,300})\]/g;

/** A marker still arriving at the very end of the text: `[`, `[ci`, `[cite:proj`. */
const PARTIAL_MARKER = /\[(?:c(?:i(?:t(?:e(?::[^\]\n]{0,300})?)?)?)?)?$/;

/** Ids inside one marker. Tolerates `[cite:a, b]` and `[cite:a, cite:b]`, which
    models produce despite being asked for one id per marker. */
function idsInMarker(inner: string): string[] {
  return inner
    .split(",")
    .map((part) => part.trim().replace(/^cite:\s*/i, ""))
    .filter((id) => CITATION_ID.test(id));
}

/** Every well-formed id cited in `text`, in order of first appearance. */
export function extractCitationIds(text: string): string[] {
  const ids: string[] = [];
  for (const match of text.matchAll(MARKER)) {
    for (const id of idsInMarker(match[1])) if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}

export type AnswerSegment = { type: "text"; text: string } | { type: "cite"; ids: string[] };

/**
 * Split answer text into prose and citation markers. A trailing half-marker is
 * hidden rather than shown, so `[cite:proj` never flickers on screen mid-stream;
 * a marker with no valid id is dropped entirely.
 */
export function segmentAnswer(text: string): AnswerSegment[] {
  const visible = text.replace(PARTIAL_MARKER, "");
  const segments: AnswerSegment[] = [];
  let cursor = 0;

  for (const match of visible.matchAll(MARKER)) {
    if (match.index > cursor) segments.push({ type: "text", text: visible.slice(cursor, match.index) });
    const ids = idsInMarker(match[1]);
    if (ids.length > 0) segments.push({ type: "cite", ids });
    cursor = match.index + match[0].length;
  }
  if (cursor < visible.length) segments.push({ type: "text", text: visible.slice(cursor) });

  return segments;
}

/* ----------------------------------------------------------------------------
   Answer layout — paragraphs and lists, without a markdown library.
   The model is asked for plain prose; this is the safety net for when it
   writes markdown anyway. Output is plain strings, rendered as React text.
   -------------------------------------------------------------------------- */

export type AnswerBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] };

const UNORDERED_ITEM = /^\s*[-*•]\s+/;
const ORDERED_ITEM = /^\s*\d+[.)]\s+/;

const stripMarkdown = (line: string) =>
  line
    .replace(/^\s{0,3}#{1,6}\s+/, "")
    .replace(/\*\*|__/g, "")
    .replace(/`/g, "");

export function toAnswerBlocks(text: string): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const endParagraph = () => {
    if (paragraph.length > 0) blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  const endList = () => {
    if (list) blocks.push({ type: "list", ...list });
    list = null;
  };

  for (const raw of text.replace(PARTIAL_MARKER, "").split(/\r?\n/)) {
    if (!raw.trim()) {
      endParagraph();
      endList();
      continue;
    }

    const ordered = ORDERED_ITEM.test(raw);
    if (ordered || UNORDERED_ITEM.test(raw)) {
      endParagraph();
      if (list && list.ordered !== ordered) endList();
      list ??= { ordered, items: [] };
      list.items.push(stripMarkdown(raw.replace(ordered ? ORDERED_ITEM : UNORDERED_ITEM, "")).trim());
      continue;
    }

    endList();
    paragraph.push(stripMarkdown(raw).trim());
  }

  endParagraph();
  endList();
  return blocks;
}
