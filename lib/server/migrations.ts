/* ============================================================================
   SQL MIGRATION HELPERS — for scripts/migrate.mts. Deliberately tiny: no ORM,
   no migration framework, just ordered .sql files applied once each.

   Neon's HTTP driver runs one statement per query, so a migration file is
   split into statements here. The rule is simple enough to trust: a
   statement ends at a semicolon that closes a line. Dollar-quoted bodies
   (functions, DO blocks) would break that rule, so they are refused outright
   instead of being split wrongly.
   ========================================================================== */

export function splitSqlStatements(source: string): string[] {
  if (source.includes("$$")) {
    throw new Error("Dollar-quoted bodies are not supported by the migration splitter");
  }

  const statements: string[] = [];
  let current: string[] = [];

  for (const raw of source.split(/\r?\n/)) {
    const line = stripLineComment(raw).trimEnd();
    if (line.trim() === "") continue;
    current.push(line);
    if (line.endsWith(";")) {
      statements.push(current.join("\n").slice(0, -1).trim());
      current = [];
    }
  }

  if (current.length > 0) throw new Error("Migration ends with an unterminated statement (missing semicolon)");
  return statements;
}

/** Drops a `--` comment, ignoring dashes inside single-quoted literals. */
function stripLineComment(line: string): string {
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === "'") quoted = !quoted;
    else if (!quoted && line[i] === "-" && line[i + 1] === "-") return line.slice(0, i);
  }
  return line;
}

/** Compares dotted versions: negative if a < b, zero if equal, positive if a > b. */
export function compareVersions(a: string, b: string): number {
  const left = a.split(".").map(Number);
  const right = b.split(".").map(Number);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    const difference = (left[i] ?? 0) - (right[i] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}
