import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { compareVersions, splitSqlStatements } from "./migrations";

const rag = readFileSync(join(process.cwd(), "db", "migrations", "0001_rag.sql"), "utf8");

describe("splitSqlStatements", () => {
  it("splits on line-ending semicolons and drops comments", () => {
    expect(splitSqlStatements("-- note\nSELECT 1; -- trailing\n\nSELECT\n  'a--b';\n")).toEqual([
      "SELECT 1",
      "SELECT\n  'a--b'",
    ]);
  });

  it("refuses dollar-quoted bodies and unterminated statements", () => {
    expect(() => splitSqlStatements("DO $$ BEGIN END $$;")).toThrow(/Dollar-quoted/);
    expect(() => splitSqlStatements("SELECT 1")).toThrow(/unterminated/);
  });
});

describe("0001_rag.sql", () => {
  const statements = splitSqlStatements(rag);

  it("is five idempotent statements", () => {
    expect(statements).toHaveLength(5);
    for (const statement of statements) expect(statement, statement.slice(0, 40)).toMatch(/IF NOT EXISTS/);
  });

  it("creates the table with the specified columns", () => {
    const table = statements.find((s) => s.startsWith("CREATE TABLE"))!;
    for (const column of ["id           text", "repo ", "path ", "start_line ", "end_line ", "commit_sha ", "content ", "content_hash ", "embedding    vector(768)", "tsv "]) {
      expect(table).toContain(column);
    }
    expect(table).toContain("GENERATED ALWAYS AS (to_tsvector('simple', content)) STORED");
    expect(table).not.toContain("'english'");
  });

  it("creates the HNSW, full-text and repo/path indexes", () => {
    expect(rag).toContain("USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)");
    expect(rag).toContain("USING gin (tsv)");
    expect(rag).toContain("ON code_chunks (repo, path)");
  });
});

describe("compareVersions", () => {
  it("orders dotted versions numerically", () => {
    expect(compareVersions("0.8.0", "0.8.0")).toBe(0);
    expect(compareVersions("0.7.4", "0.8.0")).toBeLessThan(0);
    expect(compareVersions("0.10.0", "0.8.0")).toBeGreaterThan(0);
    expect(compareVersions("0.8", "0.8.0")).toBe(0);
  });
});
