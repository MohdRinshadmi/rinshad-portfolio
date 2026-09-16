/* ============================================================================
   RECIPROCAL RANK FUSION — merges the vector and keyword rankings.

   RRF looks only at ranks, never raw scores, which is why it suits hybrid
   search: cosine distance and ts_rank_cd sit on unrelated scales, and any
   weighted blend of the two would need retuning whenever either one changed.

     score(d) = Σ 1 / (k + rank_i(d)),   k = 60   (Cormack et al., 2009)

   Ties are broken deterministically — best single rank, then the list it came
   from (vector before keyword), then id — so the same inputs always produce
   the same top 8, and the evaluation is reproducible run to run.
   ========================================================================== */

export const RRF_K = 60;

export interface FusedResult<T> {
  id: string;
  item: T;
  score: number;
  /** 1-based rank in each input list; `null` where that list missed it. */
  ranks: (number | null)[];
}

export function reciprocalRankFusion<T>(
  lists: readonly (readonly T[])[],
  idOf: (item: T) => string,
  { k = RRF_K, limit = Number.POSITIVE_INFINITY }: { k?: number; limit?: number } = {},
): FusedResult<T>[] {
  const fused = new Map<string, FusedResult<T>>();

  lists.forEach((list, listIndex) => {
    const seen = new Set<string>();
    list.forEach((item, index) => {
      const id = idOf(item);
      // A duplicate inside one list counts once, at its first (best) position.
      if (seen.has(id)) return;
      seen.add(id);

      let entry = fused.get(id);
      if (!entry) {
        entry = { id, item, score: 0, ranks: lists.map(() => null) };
        fused.set(id, entry);
      }
      entry.ranks[listIndex] = index + 1;
      entry.score += 1 / (k + index + 1);
    });
  });

  return [...fused.values()].sort(compareFused).slice(0, limit);
}

function bestRank(ranks: readonly (number | null)[]) {
  let best = { rank: Number.POSITIVE_INFINITY, list: Number.POSITIVE_INFINITY };
  ranks.forEach((rank, list) => {
    if (rank !== null && rank < best.rank) best = { rank, list };
  });
  return best;
}

function compareFused<T>(a: FusedResult<T>, b: FusedResult<T>): number {
  if (a.score !== b.score) return b.score - a.score;
  const bestA = bestRank(a.ranks);
  const bestB = bestRank(b.ranks);
  if (bestA.rank !== bestB.rank) return bestA.rank - bestB.rank;
  if (bestA.list !== bestB.list) return bestA.list - bestB.list;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}
