/**
 * Code corpus ingestion: Rinshad's three public repositories → Neon.
 *
 *   npm run ingest                clone, chunk, embed what changed, write, prune
 *   npm run ingest -- --dry-run   clone, filter, scan and chunk only —
 *                                 no embeddings, no database connection
 *
 * Runs through Node's own env loader and type stripping, like
 * scripts/verify-mail.mts. Needs DATABASE_URL and GEMINI_API_KEY, except for a
 * dry run.
 *
 * MEMORY. One repository on disk at a time, one file in memory at a time, and
 * at most one embedding batch (50 chunks) waiting. Nothing holds the corpus's
 * content — only chunk ids and hashes.
 *
 * IDEMPOTENCY. A chunk whose id and content_hash already exist is never
 * re-embedded; its commit_sha just moves to the new HEAD. Changed or new
 * chunks are embedded and upserted. Rows whose chunk no longer exists — a
 * deleted file, shifted lines, a file that became secret-bearing — are removed.
 *
 * FREE TIER. Gemini's free tier counts every CHUNK as one embed request, not
 * every batch call, and caps it at 1,000 a day per model — measured the hard
 * way at chunk 991 of 1,520. Batching cannot get under that, so a first full
 * index takes two days on the free tier. `--max-embeds=900` stops a run
 * cleanly inside the budget instead of failing at the quota: nothing is
 * pruned, the run exits 0, and the next one resumes exactly where it stopped.
 *
 * SAFETY. A secret-like file is skipped whole and logged by path and rule only
 * (lib/rag/code/secrets.ts). A repository that yields no chunks aborts the run
 * instead of pruning its rows: an empty clone is a network problem, not a
 * deleted codebase. The run fails when code_chunks passes 400 MB, well inside
 * Neon's 0.5 GB free tier.
 */
import { execFileSync } from "node:child_process";
import { lstatSync, mkdtempSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { GoogleGenAI } from "@google/genai";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { chunkFile, type CodeChunk } from "../lib/rag/code/chunk.ts";
import { skipReason } from "../lib/rag/code/files.ts";
import { CODE_REPOS, GITHUB_OWNER, type CodeRepo } from "../lib/rag/code/repos.ts";
import { findSecrets, reportSecretSkip } from "../lib/rag/code/secrets.ts";
import { EMBEDDING_BATCH_SIZE, embedDocuments, toVectorLiteral } from "../lib/rag/embed.ts";

const DRY_RUN = process.argv.includes("--dry-run");
/** Stop after this many embeddings; unlimited unless --max-embeds is passed. */
const MAX_EMBEDS = numberFlag("--max-embeds");
let embedBudget = MAX_EMBEDS;
let budgetReached = false;
const SIZE_LIMIT_BYTES = 400 * 1024 * 1024;
/** A pause between embedding calls keeps a full re-index inside free-tier rate limits. */
const BATCH_PAUSE_MS = 1_000;

type Sql = NeonQueryFunction<false, false>;

interface RepoReport {
  repo: CodeRepo;
  sha: string;
  files: number;
  chunks: number;
  unchanged: number;
  embedded: number;
  pruned: number;
  secretFiles: number;
  skipped: Record<string, number>;
}

const UPSERT = `
  INSERT INTO code_chunks (id, repo, path, start_line, end_line, commit_sha, content, content_hash, embedding)
  SELECT t.id, t.repo, t.path, t.start_line, t.end_line, t.commit_sha, t.content, t.content_hash, t.embedding::vector
  FROM unnest($1::text[], $2::text[], $3::text[], $4::int[], $5::int[], $6::text[], $7::text[], $8::text[], $9::text[])
    AS t(id, repo, path, start_line, end_line, commit_sha, content, content_hash, embedding)
  ON CONFLICT (id) DO UPDATE SET
    repo = EXCLUDED.repo, path = EXCLUDED.path, start_line = EXCLUDED.start_line, end_line = EXCLUDED.end_line,
    commit_sha = EXCLUDED.commit_sha, content = EXCLUDED.content, content_hash = EXCLUDED.content_hash,
    embedding = EXCLUDED.embedding`;

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

const git = (args: string[]) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

/** `--max-embeds 900` or `--max-embeds=900`; Infinity when absent. */
function numberFlag(name: string): number {
  const args = process.argv.slice(2);
  const index = args.findIndex((arg) => arg === name || arg.startsWith(`${name}=`));
  if (index === -1) return Number.POSITIVE_INFINITY;
  const raw = args[index].includes("=") ? args[index].split("=")[1] : args[index + 1];
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) fail(`${name} needs a positive integer, e.g. ${name}=900`);
  return value;
}

const count = (tally: Record<string, number>, key: string) => {
  tally[key] = (tally[key] ?? 0) + 1;
};

async function writeBatch(sql: Sql, ai: GoogleGenAI, chunks: CodeChunk[], sha: string) {
  const vectors = await embedDocuments(
    ai,
    chunks.map((chunk) => chunk.content),
    {
      onRetry: (attempt, delayMs, status) =>
        console.warn(`  embedding call got HTTP ${status}; retry ${attempt} in ${Math.round(delayMs / 1000)}s`),
    },
  );
  await sql.query(UPSERT, [
    chunks.map((chunk) => chunk.id),
    chunks.map((chunk) => chunk.repo),
    chunks.map((chunk) => chunk.path),
    chunks.map((chunk) => chunk.startLine),
    chunks.map((chunk) => chunk.endLine),
    chunks.map(() => sha),
    chunks.map((chunk) => chunk.content),
    chunks.map((chunk) => chunk.contentHash),
    vectors.map(toVectorLiteral),
  ]);
}

async function ingestRepo(repo: CodeRepo, sql: Sql | null, ai: GoogleGenAI | null): Promise<RepoReport> {
  const dir = mkdtempSync(join(tmpdir(), `rag-${repo}-`));
  try {
    git(["clone", "--depth", "1", "--quiet", `https://github.com/${GITHUB_OWNER}/${repo}.git`, dir]);
    const sha = git(["-C", dir, "rev-parse", "HEAD"]).trim();
    const report: RepoReport = { repo, sha, files: 0, chunks: 0, unchanged: 0, embedded: 0, pruned: 0, secretFiles: 0, skipped: {} };
    console.log(`\n${repo} @ ${sha.slice(0, 7)}`);

    const existing = new Map<string, string>();
    if (sql) {
      for (const row of await sql.query("SELECT id, content_hash FROM code_chunks WHERE repo = $1", [repo])) {
        existing.set(row.id as string, row.content_hash as string);
      }
    }

    const live = new Set<string>();
    let batch: CodeChunk[] = [];
    const flush = async () => {
      // Embed only what the budget still allows; the rest waits for the next run.
      const allowed = Math.min(batch.length, embedBudget);
      if (sql && ai && allowed > 0) {
        await writeBatch(sql, ai, batch.slice(0, allowed), sha);
        embedBudget -= allowed;
        report.embedded += allowed;
        await sleep(BATCH_PAUSE_MS);
      }
      if (allowed < batch.length || embedBudget <= 0) budgetReached = true;
      batch = [];
    };

    const paths = git(["-C", dir, "ls-files", "-z"]).split("\0").filter(Boolean).sort();
    for (const path of paths) {
      const absolute = join(dir, path);
      const stat = lstatSync(absolute);
      if (!stat.isFile()) {
        count(report.skipped, "not-a-regular-file");
        continue;
      }
      const reason = skipReason(repo, path, stat.size);
      if (reason) {
        count(report.skipped, reason);
        continue;
      }

      // Read, scan, chunk — then this file's text goes out of scope.
      const bytes = await readFile(absolute);
      if (bytes.includes(0)) {
        count(report.skipped, "binary");
        continue;
      }
      const text = bytes.toString("utf8");

      const finding = findSecrets(text, path);
      if (finding) {
        reportSecretSkip(`${repo}/${path}`, finding, (message) => console.warn(`  ${message}`));
        report.secretFiles++;
        continue;
      }

      const chunks = chunkFile(repo, path, text);
      report.files++;
      report.chunks += chunks.length;
      for (const chunk of chunks) {
        live.add(chunk.id);
        if (existing.get(chunk.id) === chunk.contentHash) {
          report.unchanged++;
          continue;
        }
        batch.push(chunk);
        if (batch.length === EMBEDDING_BATCH_SIZE) await flush();
      }
      if (budgetReached) break;
    }
    await flush();

    // A partial pass has not seen every file, so its `live` set is incomplete:
    // pruning against it would delete rows this run simply never reached.
    if (budgetReached) {
      console.warn(`  embedding budget spent — ${repo} is only partly indexed; nothing pruned`);
      return report;
    }

    if (report.chunks === 0) {
      throw new Error(`${repo}: no indexable chunks at ${sha.slice(0, 7)} — refusing to prune its rows.`);
    }

    if (sql) {
      const deleted = await sql.query(
        "DELETE FROM code_chunks WHERE repo = $1 AND NOT (id = ANY($2::text[])) RETURNING id",
        [repo, [...live]],
      );
      report.pruned = deleted.length;
      await sql.query("UPDATE code_chunks SET commit_sha = $2 WHERE repo = $1 AND commit_sha <> $2", [repo, sha]);
    }
    return report;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  console.log(DRY_RUN ? "\nCode ingestion — DRY RUN: no embeddings, no database writes" : "\nCode ingestion");

  let sql: Sql | null = null;
  let ai: GoogleGenAI | null = null;
  if (!DRY_RUN) {
    const databaseUrl = process.env.DATABASE_URL?.trim();
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!databaseUrl || !apiKey) fail("DATABASE_URL and GEMINI_API_KEY must both be set (or pass --dry-run).");
    sql = neon(databaseUrl);
    ai = new GoogleGenAI({ apiKey });
  }

  const reports: RepoReport[] = [];
  for (const repo of CODE_REPOS) {
    reports.push(await ingestRepo(repo, sql, ai));
    if (budgetReached) break;
  }

  console.log("\nSummary");
  for (const r of reports) {
    console.log(
      `  ${r.repo} @ ${r.sha.slice(0, 7)}: ${r.files} files, ${r.chunks} chunks` +
        (DRY_RUN ? "" : ` (${r.unchanged} unchanged, ${r.embedded} embedded, ${r.pruned} pruned)`) +
        `, ${r.secretFiles} skipped as secret-like, other skips ${JSON.stringify(r.skipped)}`,
    );
  }
  const totalFiles = reports.reduce((n, r) => n + r.files, 0);
  const totalChunks = reports.reduce((n, r) => n + r.chunks, 0);
  console.log(`  total: ${totalFiles} files, ${totalChunks} chunks`);
  if (budgetReached) {
    console.warn(
      `\n! Stopped after ${MAX_EMBEDS} embeddings (--max-embeds). The index is partly updated and nothing was\n` +
        `  pruned. Re-run once the daily quota resets; unchanged chunks are skipped, so it continues from here.`,
    );
  }

  if (!sql) {
    console.log("\nDry run complete — nothing was embedded or written.\n");
    return;
  }

  const orphans = await sql.query("DELETE FROM code_chunks WHERE NOT (repo = ANY($1::text[])) RETURNING id", [[...CODE_REPOS]]);
  if (orphans.length > 0) console.log(`  removed ${orphans.length} rows from repositories no longer indexed`);

  const [size] = await sql.query(
    "SELECT pg_total_relation_size('code_chunks')::bigint AS bytes, (SELECT count(*) FROM code_chunks)::int AS rows",
  );
  const bytes = Number(size.bytes);
  console.log(`\npg_total_relation_size('code_chunks'): ${(bytes / 1024 / 1024).toFixed(1)} MB across ${size.rows} rows`);
  if (bytes > SIZE_LIMIT_BYTES) {
    fail(`code_chunks is over the ${SIZE_LIMIT_BYTES / 1024 / 1024} MB safety limit for Neon's free tier.`);
  }
  console.log("✓ Ingestion complete.\n");
}

main().catch((err: unknown) => fail(err instanceof Error ? err.message : String(err)));
