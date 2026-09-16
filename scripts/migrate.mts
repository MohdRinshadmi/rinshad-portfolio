/**
 * Apply db/migrations/*.sql to DATABASE_URL, in filename order, once each.
 *
 *   npm run db:migrate
 *
 * Run through Node's own env loader and type stripping, like
 * scripts/verify-mail.mts. Each migration runs as one transaction together
 * with its row in schema_migrations, and every migration is written to be
 * idempotent, so an interrupted run is safe to repeat.
 *
 * Also checks pgvector: repo-filtered code search relies on
 * `hnsw.iterative_scan`, which arrived in pgvector 0.8.0.
 */
import { readdirSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { compareVersions, splitSqlStatements } from "../lib/server/migrations.ts";

const MIGRATIONS = new URL("../db/migrations/", import.meta.url);
const MIN_PGVECTOR = "0.8.0";

function fail(message: string): never {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) fail("DATABASE_URL is not set. Add your Neon connection string to .env (see .env.example).");

  const sql = neon(url);
  await sql.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  const applied = new Set((await sql.query("SELECT name FROM schema_migrations")).map((row) => row.name as string));

  const files = readdirSync(MIGRATIONS).filter((name) => /^\d{4}_[\w-]+\.sql$/.test(name)).sort();
  console.log("\nMigrations");
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`  ✓ ${file} (already applied)`);
      continue;
    }
    const statements = splitSqlStatements(readFileSync(new URL(file, MIGRATIONS), "utf8"));
    await sql.transaction([
      ...statements.map((statement) => sql.query(statement)),
      sql.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]),
    ]);
    console.log(`  ✓ ${file} applied (${statements.length} statements)`);
  }

  const [extension] = await sql.query("SELECT extversion FROM pg_extension WHERE extname = 'vector'");
  const version = extension?.extversion as string | undefined;
  if (!version) fail("pgvector is not installed.");
  console.log(`\npgvector ${version}`);
  if (compareVersions(version, MIN_PGVECTOR) < 0) {
    fail(`pgvector ${MIN_PGVECTOR}+ is required for repo-filtered search (hnsw.iterative_scan); found ${version}.`);
  }
  console.log("✓ Database ready.\n");
}

main().catch((err: unknown) => fail(err instanceof Error ? err.message : String(err)));
