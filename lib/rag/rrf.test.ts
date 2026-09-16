import { describe, expect, it } from "vitest";
import { RRF_K, reciprocalRankFusion } from "./rrf";

const ids = (results: { id: string }[]) => results.map((result) => result.id);
const fuse = (vector: string[], keyword: string[], limit?: number) =>
  reciprocalRankFusion([vector, keyword], (id) => id, { limit });

describe("reciprocalRankFusion", () => {
  it("sums 1 / (k + rank) across the lists, with k = 60", () => {
    const [top] = fuse(["a"], ["a"]);
    expect(RRF_K).toBe(60);
    expect(top.score).toBe(1 / 61 + 1 / 61);
    expect(top.ranks).toEqual([1, 1]);
  });

  it("ranks a chunk both searches found above chunks either found alone", () => {
    expect(ids(fuse(["x", "y"], ["y", "z"]))).toEqual(["y", "x", "z"]);
  });

  it("handles disjoint lists, breaking equal scores by best rank, then vector first", () => {
    expect(ids(fuse(["a", "b"], ["c", "d"]))).toEqual(["a", "c", "b", "d"]);
  });

  it("keeps vector-only and keyword-only chunks, with null for the list that missed each", () => {
    const results = fuse(["v"], ["k"]);
    expect(results.find((r) => r.id === "v")?.ranks).toEqual([1, null]);
    expect(results.find((r) => r.id === "k")?.ranks).toEqual([null, 1]);
  });

  it("merges a duplicate inside one list at its first position only", () => {
    const [a, b] = fuse(["a", "b", "a"], []);
    expect(a).toMatchObject({ id: "a", ranks: [1, null], score: 1 / 61 });
    expect(b).toMatchObject({ id: "b", ranks: [2, null] });
  });

  it("breaks symmetric ties the same way every time", () => {
    // a: vector #1 + keyword #3; c: vector #3 + keyword #1 — identical scores.
    const first = ids(fuse(["a", "b", "c"], ["c", "d", "a"]));
    expect(first).toEqual(["a", "c", "b", "d"]);
    for (let run = 0; run < 5; run++) expect(ids(fuse(["a", "b", "c"], ["c", "d", "a"]))).toEqual(first);
  });

  it("returns at most `limit` results", () => {
    const vector = Array.from({ length: 20 }, (_, i) => `v${i}`);
    const keyword = Array.from({ length: 20 }, (_, i) => `k${i}`);
    expect(fuse(vector, keyword, 8)).toHaveLength(8);
  });

  it("keeps the item from the first list that contained it", () => {
    const [top] = reciprocalRankFusion(
      [[{ id: "a", from: "vector" }], [{ id: "a", from: "keyword" }]],
      (item) => item.id,
    );
    expect(top.item.from).toBe("vector");
  });
});
