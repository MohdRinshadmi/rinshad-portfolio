import { afterEach, describe, expect, it, vi } from "vitest";
import { describeSecretSkip, findSecrets, reportSecretSkip, type SecretKind } from "./secrets";

/* ============================================================================
   SECRET GUARD

   Every secret-shaped fixture is assembled at runtime from fragments. A
   literal "AKIA…" or "ghp_…" in this file would trip GitHub push protection
   and secret scanners on this repository itself; the joins keep the test
   honest without committing anything a scanner reads as a live credential.
   ========================================================================== */

const cat = (...parts: string[]) => parts.join("");
const fill = (length: number, alphabet = "aB3dE5gH7jK9mN1pQ3sT5vW7yZ") =>
  Array.from({ length }, (_, i) => alphabet[i % alphabet.length]).join("");

interface Case {
  name: string;
  kind: SecretKind;
  path: string;
  secret: string;
  line: (secret: string) => string;
}

const CASES: Case[] = [
  { name: "an RSA private-key header", kind: "private-key", path: "certs/dev.ts", secret: cat("-----BEGIN ", "RSA PRIVATE KEY-----"), line: (s) => s },
  { name: "an OpenSSH private-key header", kind: "private-key", path: "deploy/notes.md", secret: cat("-----BEGIN ", "OPENSSH PRIVATE KEY-----"), line: (s) => s },
  { name: "an AWS access key id", kind: "aws-access-key", path: "src/s3.ts", secret: cat("AK", "IA", fill(16, "Z3QX7PLMN2WQ84KT")), line: (s) => `const client = new S3({ accessKeyId: "${s}" });` },
  { name: "an sk- API key", kind: "sk-api-key", path: "src/llm.py", secret: cat("sk", "-proj-", fill(32)), line: (s) => `client = OpenAI(api_key="${s}")` },
  { name: "a GitHub token", kind: "github-token", path: ".github/workflows/release.yml", secret: cat("gh", "p_", fill(36)), line: (s) => `      GH_TOKEN: ${s}` },
  { name: "a Slack token", kind: "slack-token", path: "scripts/notify.sh", secret: cat("xo", "xb-", "1234567890-", fill(24)), line: (s) => `curl -H "Authorization: Bearer ${s}" https://slack.example/api` },
  { name: "a Google API key", kind: "google-api-key", path: "apps/mobile/src/config.ts", secret: cat("AI", "za", fill(35, "Sy9kW2mQ_x-Lp4")), line: (s) => `export const MAPS_KEY = '${s}';` },
  { name: "a Groq API key", kind: "groq-api-key", path: "src/groq.ts", secret: cat("gs", "k_", fill(40)), line: (s) => `const groq = new Groq({ apiKey: "${s}" });` },
  { name: "a signed JWT", kind: "jwt", path: "test/auth.test.ts", secret: cat("ey", "J", fill(20), ".ey", "J", fill(24), ".", fill(30)), line: (s) => `const header = "${s}";` },
  { name: "a literal bearer token", kind: "bearer-token", path: "scripts/call.ts", secret: fill(40), line: (s) => `fetch(url, { headers: { Authorization: "Bearer ${s}" } });` },
  { name: "a bcrypt hash", kind: "password-hash", path: "db/seed.sql", secret: cat("$2b$", "12$", fill(53, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ./")), line: (s) => `INSERT INTO users (email, password_hash) VALUES ('a@b.c', '${s}');` },
  { name: "a password assignment with a literal value", kind: "password-literal", path: "src/db.go", secret: "hunter2-Correct-Horse", line: (s) => `\tPassword := "${s}"` },
  { name: "a password inside a JSON request body", kind: "password-literal", path: "docs/api.md", secret: "Demo-Pass-2024!", line: (s) => `curl -d '{"email":"a@b.c","password":"${s}"}' localhost:8080/login` },
  { name: "an unquoted YAML password", kind: "password-literal", path: "docker-compose.yml", secret: "compose-db-pass", line: (s) => `      POSTGRES_PASSWORD: ${s}` },
  { name: "a secret assignment with a literal value", kind: "secret-literal", path: "src/config.ts", secret: "jwt-signing-material-0042", line: (s) => `export const JWT_SECRET = "${s}";` },
  { name: "an exported shell secret", kind: "secret-literal", path: "scripts/dev.sh", secret: "shell-secret-0042", line: (s) => `export CLIENT_SECRET=${s}` },
  { name: "a token assignment with a literal value", kind: "token-literal", path: "src/api.py", secret: "svc-token-0042", line: (s) => `SERVICE_TOKEN = '${s}'` },
  { name: "a CI service token", kind: "token-literal", path: ".github/workflows/ci.yml", secret: "ci-service-token-0123456789", line: (s) => `      AI_SERVICE_TOKEN: ${s}` },
  { name: "a credential-bearing connection string", kind: "credential-url", path: "infrastructure/docker/docker-compose.yml", secret: "collab-db-pass", line: (s) => `  DATABASE_URL: postgresql://collab:${s}@postgres:5432/collab` },
  { name: "a literal default for a secret env var", kind: "env-default-literal", path: "scripts/smoke.sh", secret: "fallback-pass-99", line: (s) => `PGPASSWORD="\${PGPASSWORD:-${s}}"` },
  { name: "a literal fallback for a secret env var", kind: "env-default-literal", path: "src/env.ts", secret: "fallback-secret-99", line: (s) => `const signingKey = process.env.JWT_SECRET ?? "${s}";` },
];

describe("findSecrets — catches", () => {
  for (const c of CASES) {
    it(c.name, () => {
      const text = ["// surrounding code", c.line(c.secret), "export {};"].join("\n");
      expect(findSecrets(text, c.path)).toEqual({ kind: c.kind, line: 2 });
    });
  }

  it("reports the line of the first finding in a longer file", () => {
    const text = ["import x from 'y';", "", "const a = 1;", `const password = "${cat("not-", "real-0042")}";`].join("\n");
    expect(findSecrets(text, "src/a.ts")).toEqual({ kind: "password-literal", line: 4 });
  });
});

describe("findSecrets — leaves alone code that merely handles secrets", () => {
  const SAFE: [path: string, line: string][] = [
    ["src/types/api.ts", "  accessToken: string;"],
    ["src/types/user.ts", "  password?: string;"],
    ["src/stores/auth.store.ts", "  accessToken: null,"],
    ["src/services/api/client.ts", '  credentials: "include",'],
    ["src/config/env.ts", "  GEMINI_API_KEY: z.string().min(1),"],
    ["apps/api/validators/auth.validator.js", "  password: z.string().min(8).max(128),"],
    ["apps/api/config/passport.js", "  secretOrKey: config.jwt.accessSecret,"],
    ["docker-compose.yml", "      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}"],
    [".github/workflows/deploy.yml", "      GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}"],
    ["docker-compose.yml", "      JWT_SECRET: changeme"],
    ["infrastructure/k8s/base/ingress.yaml", "    - secretName: collab-tls"],
    ["src/features/auth/LoginForm.tsx", '<input type="password" name="password" autoComplete="current-password" placeholder="Password" />'],
    ["src/i18n/en.ts", '  password: "Password",'],
    ["src/auth/refresh.ts", "const refreshTokenTtl = '7d';"],
    ["src/llm/tokens.ts", 'const tokenizer = "cl100k_base";'],
    ["src/chat.ts", "const maxOutputTokens = 1024;"],
    ["src/errors.ts", 'throw new ApiError(401, "Invalid password or email");'],
    ["src/auth.ts", 'if (password === "") return;'],
    ["backend/auth/service.go", "\thash, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)"],
    ["src/api.ts", "headers.Authorization = `Bearer ${token}`;"],
    ["src/db.ts", "const url = `postgres://${user}:${password}@${host}/app`;"],
    ["README.md", "Set `GEMINI_API_KEY` in `.env.local`, then run `npm run dev`."],
  ];

  for (const [path, line] of SAFE) {
    it(`${path}: ${line.trim()}`, () => {
      expect(findSecrets(line, path)).toBeNull();
    });
  }
});

describe("logging a skipped file", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  for (const c of CASES) {
    it(`never prints the value of ${c.name}`, () => {
      const log = vi.fn();
      const finding = findSecrets(c.line(c.secret), c.path);
      expect(finding).not.toBeNull();

      reportSecretSkip(`some-repo/${c.path}`, finding!, log);
      const printed = log.mock.calls.flat().join("\n");

      expect(printed).toBe(`Skipped secret-like file: some-repo/${c.path} (${c.kind}, line 1)`);
      expect(printed).not.toContain(c.secret);
      expect(JSON.stringify(finding)).not.toContain(c.secret);
    });
  }

  it("writes to console.warn by default", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportSecretSkip("repo/a.ts", { kind: "token-literal", line: 3 });
    expect(warn).toHaveBeenCalledWith(describeSecretSkip("repo/a.ts", { kind: "token-literal", line: 3 }));
  });
});

describe("findSecrets — regressions from the ingestion dry run", () => {
  it("catches a secret default passed to a Go env helper", () => {
    const secret = cat("dev-access-", "secret-0042");
    const text = ["func Load() Config {", `\t\tAccessSecret:  getEnv("JWT_ACCESS_SECRET", "${secret}"),`, "}"].join("\n");
    const finding = findSecrets(text, "backend/internal/infrastructure/config/config.go");

    expect(finding).toEqual({ kind: "env-default-literal", line: 2 });
    expect(describeSecretSkip("iot/config.go", finding!)).not.toContain(secret);
  });

  it("still indexes env helpers whose defaults are empty or not strings", () => {
    expect(findSecrets('\t\t\tPassword: getEnv("REDIS_PASSWORD", ""),', "config.go")).toBeNull();
    expect(findSecrets('\t\tPort: getEnvInt("API_PORT", 8080),', "config.go")).toBeNull();
  });

  it("reads GitHub Actions permissions as permissions, not tokens", () => {
    const workflow = ".github/workflows/deploy-prod.yml";
    expect(findSecrets("      id-token: write          # OIDC to AWS, no static creds", workflow)).toBeNull();
    expect(findSecrets("      contents: read", workflow)).toBeNull();
  });
});
