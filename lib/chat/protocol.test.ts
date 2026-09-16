import { describe, expect, it } from "vitest";
import {
  createFrameDecoder,
  encodeFrame,
  extractCitationIds,
  ProtocolError,
  segmentAnswer,
  toAnswerBlocks,
  type Frame,
} from "./protocol";

/* ============================================================================
   The browser receives the stream as arbitrary byte chunks. Nothing guarantees
   a chunk ends on a line, or even on a character — these tests split frames in
   the worst places on purpose.
   ========================================================================== */

const bytes = (text: string) => new TextEncoder().encode(text);

describe("frame decoder", () => {
  it("reassembles a frame split halfway through its JSON", () => {
    const decoder = createFrameDecoder();
    expect(decoder.push(bytes('{"type":"tok'))).toEqual([]);
    expect(decoder.push(bytes('en","text":"Hi"}\n'))).toEqual([{ type: "token", text: "Hi" }]);
  });

  it("parses several frames delivered in one chunk", () => {
    const decoder = createFrameDecoder();
    const wire = encodeFrame({ type: "token", text: "a" }) + encodeFrame({ type: "done" });
    expect(decoder.push(bytes(wire))).toEqual([{ type: "token", text: "a" }, { type: "done" }]);
  });

  it("keeps a multi-byte character that is split across chunks", () => {
    const decoder = createFrameDecoder();
    const wire = bytes(encodeFrame({ type: "token", text: "Résumé — ✓" }));
    const cut = wire.indexOf(0xc3) + 1; // inside the two-byte "é"

    const frames = [...decoder.push(wire.slice(0, cut)), ...decoder.push(wire.slice(cut))];
    expect(frames).toEqual([{ type: "token", text: "Résumé — ✓" }]);
  });

  it("flushes a final line that arrived without a newline", () => {
    const decoder = createFrameDecoder();
    expect(decoder.push(bytes('{"type":"done"}'))).toEqual([]);
    expect(decoder.flush()).toEqual([{ type: "done" }]);
  });

  it("round-trips every frame type", () => {
    const frames: Frame[] = [
      { type: "token", text: 'line\nwith "quotes"' },
      { type: "source", id: "faq/x", title: "X", url: "https://example.com/#faq" },
      { type: "tool", name: "searchCode", status: "running", query: "jwt refresh", repo: "ai-life-assistant" },
      { type: "tool", name: "searchCode", status: "done", results: 8 },
      { type: "tool", name: "searchCode", status: "error" },
      { type: "done" },
      { type: "error", code: "quota" },
    ];
    const decoder = createFrameDecoder();
    expect(decoder.push(bytes(frames.map(encodeFrame).join("")))).toEqual(frames);
  });

  it("ignores blank lines and frame types it does not know", () => {
    const decoder = createFrameDecoder();
    expect(decoder.push(bytes('\n{"type":"trace","name":"search"}\n\n{"type":"done"}\n'))).toEqual([
      { type: "done" },
    ]);
  });

  it("maps an unknown error code to a generic upstream failure", () => {
    const decoder = createFrameDecoder();
    expect(decoder.push(bytes('{"type":"error","code":"exploded"}\n'))).toEqual([
      { type: "error", code: "upstream" },
    ]);
  });

  it("throws a ProtocolError on a line that is not a frame", () => {
    expect(() => createFrameDecoder().push(bytes("<html>502 Bad Gateway</html>\n"))).toThrow(
      ProtocolError,
    );
    expect(() => createFrameDecoder().push(bytes('{"type":"token"}\n'))).toThrow(ProtocolError);
    expect(() => createFrameDecoder().push(bytes('{"type":"tool","name":"searchCode","status":"running"}\n'))).toThrow(
      ProtocolError,
    );
  });
});

describe("citations", () => {
  it("extracts well-formed ids in order of first appearance, once each", () => {
    const text =
      "Cut response time 35% [cite:profile/key-achievements]. Streams tokens [cite:project/ai-life-assistant]" +
      " and again [cite:profile/key-achievements].";
    expect(extractCitationIds(text)).toEqual(["profile/key-achievements", "project/ai-life-assistant"]);
  });

  it("tolerates comma-separated ids and rejects anything that is not an id", () => {
    expect(extractCitationIds("[cite:faq/a, cite:faq/b] [cite:https://evil.example] [cite:Faq/X]")).toEqual([
      "faq/a",
      "faq/b",
    ]);
  });

  it("segments prose and markers, dropping markers with no valid id", () => {
    expect(segmentAnswer("One [cite:a/b]two[cite:c-d][cite:<script>] end")).toEqual([
      { type: "text", text: "One " },
      { type: "cite", ids: ["a/b"] },
      { type: "text", text: "two" },
      { type: "cite", ids: ["c-d"] },
      { type: "text", text: " end" },
    ]);
  });

  it("hides a marker that is still streaming in", () => {
    for (const tail of ["[", "[ci", "[cite:", "[cite:project/ai-li"]) {
      expect(segmentAnswer(`Answer ${tail}`), tail).toEqual([{ type: "text", text: "Answer " }]);
    }
  });
});

describe("answer blocks", () => {
  it("groups paragraphs and lists, and strips stray markdown", () => {
    const text = [
      "## Summary",
      "He owns the **backend**",
      "end to end.",
      "",
      "- `Node.js` APIs",
      "* Redis caching",
      "1. First",
      "2. Second",
      "Closing line.",
    ].join("\n");

    expect(toAnswerBlocks(text)).toEqual([
      { type: "paragraph", text: "Summary He owns the backend end to end." },
      { type: "list", ordered: false, items: ["Node.js APIs", "Redis caching"] },
      { type: "list", ordered: true, items: ["First", "Second"] },
      { type: "paragraph", text: "Closing line." },
    ]);
  });

  it("returns nothing for an answer that has not started", () => {
    expect(toAnswerBlocks("")).toEqual([]);
    expect(toAnswerBlocks("[cite:")).toEqual([]);
  });
});
