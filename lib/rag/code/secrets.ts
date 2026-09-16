/* ============================================================================
   SECRET GUARD — the automatic backstop for code ingestion.

   Anything indexed can be quoted by a public chatbot, so a file containing
   anything secret-shaped is skipped WHOLE: no partial indexing, no redacting
   the matched line and embedding the rest. A redaction can miss a second copy
   three lines further down; a skipped file cannot leak.

   A finding carries the rule and the line number — never the matched text —
   so no log line built from one can print a secret.

   Patterns are tuned against the audited repositories: `accessToken: string`,
   `credentials: "include"` and `z.string()` schemas are everywhere in auth
   code, and skipping those files would gut the most useful search results.
   A pattern is still not sufficient on its own — the audit found a plaintext
   demo password in a comment, which no assignment rule sees. That is what
   DENYLIST in ./repos.ts is for.
   ========================================================================== */

export type SecretKind =
  | "private-key"
  | "aws-access-key"
  | "sk-api-key"
  | "github-token"
  | "slack-token"
  | "google-api-key"
  | "groq-api-key"
  | "jwt"
  | "bearer-token"
  | "password-hash"
  | "credential-url"
  | "password-literal"
  | "secret-literal"
  | "token-literal"
  | "env-default-literal";

export interface SecretFinding {
  kind: SecretKind;
  /** 1-based line of the first finding in the file. */
  line: number;
}

/** Provider-format credentials, recognisable by shape alone in any file. */
const TOKEN_RULES: readonly (readonly [SecretKind, RegExp])[] = [
  ["private-key", /-----BEGIN[A-Z0-9 ]*PRIVATE KEY(?: BLOCK)?-----/],
  ["aws-access-key", /\b(?:AKIA|ASIA|AGPA|AIDA|AROA|ANPA|ANVA|APKA)[0-9A-Z]{16}\b/],
  ["sk-api-key", /\bsk-(?:proj-|ant-|or-)?[A-Za-z0-9_-]{20,}|\bsk_(?:live|test)_[A-Za-z0-9]{16,}/],
  ["github-token", /\bgh[pousr]_[A-Za-z0-9]{36,}|\bgithub_pat_[A-Za-z0-9_]{22,}/],
  ["slack-token", /\bxox[abposr]-[A-Za-z0-9-]{10,}/i],
  ["google-api-key", /\bAIza[0-9A-Za-z_-]{35}/],
  ["groq-api-key", /\bgsk_[A-Za-z0-9]{20,}/],
  ["jwt", /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/],
  ["bearer-token", /\bBearer\s+[A-Za-z0-9._~+/-]{24,}/],
  ["password-hash", /\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}/],
];

/** A name that holds a secret… */
const SECRET_NAME =
  /pass(?:word|wd|phrase)|(?:^|[_-])pass$|pwd|secret|token|api[_-]?key|apikey|access[_-]?key|private[_-]?key|credential/i;

/** …unless the name only describes one (`tokenTtl`, `passwordHash`, `secretName`). */
const DESCRIPTIVE_NAME =
  /(?:count|max|min|length|len|limit|size|type|kind|name|header|field|label|placeholder|hint|prefix|suffix|url|uri|path|endpoint|route|policy|ttl|expires?_?(?:in|at)?|expiry|timeout|hash|digest|regex|pattern|schema|error|message|input|output|usage|rotation|store|storage|mode|format|version|strategy|id|ids|tokens|tokenizer|required|enabled|visible)$/i;

/** Values that are references, placeholders or plain vocabulary, not secrets. */
const HARMLESS_VALUE =
  /^(?:\$.*|<[^>]*>|\{\{.*\}\}|%[^%]*%|\*+|x{3,}|\.{3}|…|changeme|change[-_ ]?me|replace[-_ ]?me|your[-_].*|redacted|placeholder|example|dummy|todo|tbd|none|null|nil|undefined|true|false|yes|no|on|off|read|write|include|same-origin|omit|bearer|basic|required|optional|string|number|boolean|text|hidden|password|new-password|current-password|one-time-code|token|secret|api[-_]?key)$/i;

const QUOTED_ASSIGNMENT = /(["']?)([A-Za-z_$][\w$.-]*)\1\s*(?::=|[:=])(?![=>])\s*(["'`])([^"'`\r\n]*)\3/g;
/** YAML / env / shell / Dockerfile, where values are routinely unquoted. */
const UNQUOTED_ASSIGNMENT =
  /^\s*(?:-\s+)?(?:export\s+|ENV\s+|ARG\s+)?(["']?)([A-Za-z_][\w.-]*)\1\s*[:=]\s*([^\s"'`#][^\s#]*)\s*(?:#.*)?$/i;
const DOCKER_ENV_PAIR = /^\s*ENV\s+([A-Za-z_]\w*)\s+([^\s"'`#=][^\s#]*)\s*$/i;
/** `${DB_PASSWORD:-literal}` and friends. */
const ENV_DEFAULT = /\$\{([A-Za-z_]\w*)(?::?-|:?=)([^}]*)\}/g;
const ENV_FALLBACK = /process\.env\.([A-Za-z_]\w*)\s*(?:\?\?|\|\|)\s*(["'`])([^"'`\r\n]*)\2/g;
/** Any env helper with a literal default: `getEnv("JWT_SECRET", "…")` (Go),
    `os.getenv(…)` (Python), `envOr(…)`. The dry run found the Go form. */
const ENV_FALLBACK_CALL = /(?:\b[\w.]*env\w*|os\.environ\.get)\(\s*["']([A-Za-z_]\w*)["']\s*,\s*(["'`])([^"'`\r\n]*)\2/gi;
const CREDENTIAL_URL = /\b[a-z][a-z0-9+.-]{1,24}:\/\/[^\s:@/"'`]+:([^\s@/"'`]+)@/gi;

const CONFIG_FILE = /(?:^|\/)(?:Dockerfile|\.env[^/]*|[^/]+\.(?:ya?ml|sh|bash|toml|ini|conf|properties))$/i;

function kindForName(name: string): SecretKind | null {
  const last = name.split(".").pop() ?? name;
  if (!SECRET_NAME.test(last) || DESCRIPTIVE_NAME.test(last)) return null;
  if (/pass|pwd/i.test(last)) return "password-literal";
  if (/token/i.test(last)) return "token-literal";
  return "secret-literal";
}

const isLiteral = (value: string) => value.length >= 3 && !/\s/.test(value) && !HARMLESS_VALUE.test(value);

function scanLine(line: string, configFile: boolean): SecretKind | null {
  for (const [kind, pattern] of TOKEN_RULES) if (pattern.test(line)) return kind;

  for (const match of line.matchAll(QUOTED_ASSIGNMENT)) {
    const kind = kindForName(match[2]);
    if (kind && isLiteral(match[4])) return kind;
  }

  if (configFile) {
    const unquoted = UNQUOTED_ASSIGNMENT.exec(line);
    const unquotedKind = unquoted && kindForName(unquoted[2]);
    if (unquoted && unquotedKind && isLiteral(unquoted[3])) return unquotedKind;

    const pair = DOCKER_ENV_PAIR.exec(line);
    const pairKind = pair && kindForName(pair[1]);
    if (pair && pairKind && isLiteral(pair[2])) return pairKind;
  }

  for (const pattern of [ENV_DEFAULT, ENV_FALLBACK, ENV_FALLBACK_CALL]) {
    for (const match of line.matchAll(pattern)) {
      if (kindForName(match[1]) && isLiteral(match[match.length - 1])) return "env-default-literal";
    }
  }

  for (const match of line.matchAll(CREDENTIAL_URL)) {
    if (!/^[$<{%*]/.test(match[1]) && !HARMLESS_VALUE.test(match[1])) return "credential-url";
  }

  return null;
}

/** The first secret-like line in `text`, or `null` if the file may be indexed. */
export function findSecrets(text: string, path: string): SecretFinding | null {
  const configFile = CONFIG_FILE.test(path);
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const kind = scanLine(lines[index], configFile);
    if (kind) return { kind, line: index + 1 };
  }
  return null;
}

/** The only log line ingestion writes about a secret: where, and which rule. */
export function describeSecretSkip(location: string, finding: SecretFinding): string {
  return `Skipped secret-like file: ${location} (${finding.kind}, line ${finding.line})`;
}

export function reportSecretSkip(
  location: string,
  finding: SecretFinding,
  log: (message: string) => void = console.warn,
): void {
  log(describeSecretSkip(location, finding));
}
