# Deployment — Vercel

First production deployment of a site that has never been deployed. Every claim
below was verified against the installed Next.js 16.2.6 docs or current Vercel
docs; the "why" is recorded so nobody re-litigates a decision from memory.

---

## 0. Decisions already made

| Decision | Value | Why |
| --- | --- | --- |
| Canonical domain | the project's `*.vercel.app` hostname | `rinshad.dev` is **NXDOMAIN** — not registered, not delegated. Verified against the local resolver and `8.8.8.8`. Shipping canonicals to a domain that does not resolve is worse than having none. |
| Site URL source | `NEXT_PUBLIC_SITE_URL` env var | One variable to change when the custom domain arrives. No code edit. |
| Contact route runtime | `nodejs` (pinned) | Nodemailer needs raw TCP+TLS. The Edge runtime has no such API. |
| `maxDuration` | `60` | Must outlast the ~35s SMTP worst case, and stay well below Vercel's 300s default so a wedged connection fails in a minute rather than billing five. |
| Function region | `bom1` (Mumbai) — set in the dashboard | Owner and audience are in India. Cannot be set in code: Vercel only honours `preferredRegion` for `runtime = 'edge'`. |
| Node | `22.x`, pinned in `engines` | Matches local `v22.21.1`. Satisfies `next >=20.9` and `vitest ^22.12.0`. Node 20 is deprecated on Vercel from 2026-10-01; 24 would diverge from local for no reason. |
| Analytics | **not installed** | `@vercel/analytics` would need `script-src` / `connect-src` changes. That is a CSP redesign, not a deployment. |
| HSTS preload | **not submitted** | The header advertises `preload`, but submission is a separate, deliberate, hard-to-undo step. Do it only once the domain architecture is final. |

---

## 1. Create the project

Import `github.com/MohdRinshadmi/rinshad-portfolio` in Vercel.

Framework preset **Next.js**. Leave build command, install command and output
directory on their defaults — this app needs the normal Next.js deployment
model because it has a real serverless route (`/api/contact`). Do **not** set
`output: "export"` or `standalone`.

---

## 2. Environment variables

Settings → Environment Variables.

| Variable | Value | Environments |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` | Production, Preview |
| `SMTP_PORT` | `465` | Production, Preview |
| `SMTP_USER` | `rinshad803@gmail.com` | Production, Preview |
| `SMTP_PASS` | *the Gmail App Password* | Production, Preview |
| `CONTACT_EMAIL` | `rinshad803@gmail.com` | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` | Production |

**`SMTP_PASS`**: paste the secret only — **no surrounding quotes**. Google shows
it as four groups of four; the app normalises those spaces away
(`normalizeSecret` in `lib/server/mail.ts`), so either form works, but quotes do
not. A wrong value returns `535 Authentication failed`, and it must be an App
Password, not the account password.

**`NEXT_PUBLIC_SITE_URL`**: set it to the real production hostname once Vercel
assigns it, no trailing slash. Leave it unset on Preview — preview builds then
fall through to `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel points at the
production domain, so previews emit production canonicals instead of
self-canonicalising. That is the desired SEO behaviour.

Port 465 is confirmed open on Vercel for authenticated submission with implicit
TLS. Port 25 is blocked outbound; 587 (STARTTLS) also works if you ever switch.

---

## 3. Node version

`package.json` pins `"engines": { "node": "22.x" }`, and `engines` **overrides**
the dashboard setting. Nothing to do — but if you want them consistent, set
Settings → Build and Deployment → Node.js Version to 22.x as well.

---

## 4. Function region

Settings → Functions → Function Region → **Mumbai (bom1)**.

Hobby allows one region. This cannot live in the route file: `preferredRegion`
is edge-only on Vercel and throws on an unsupported value.

---

## 5. Preview deployments must not be indexed

Already handled in code. `next.config.ts` adds `X-Robots-Tag: noindex, nofollow`
whenever `VERCEL_ENV` is set and is not `production`. Verified both ways against
real builds: present in the preview manifest, absent in the production one.

`app/robots.ts` allows every crawler unconditionally, which is right for
production and would be wrong for previews on its own — the header is what
covers the gap, and it also covers non-HTML responses like `sitemap.xml`.

Optionally also turn on Vercel Deployment Protection for previews. Belt and
braces; not required.

---

## 6. Deploy

Push the branch, open the PR, merge to `main`, or promote the preview. Record
the commit SHA, deployment ID, production URL and timestamp.

---

## 7. Verify from the public internet

Nothing below is satisfied by "the deploy succeeded".

### Headers

```bash
curl -sI https://<production-domain>/
```

Expect `Content-Security-Policy`, `Strict-Transport-Security`,
`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy`, `Cross-Origin-Resource-Policy`, `Permissions-Policy`.

The CSP must contain **no** `unsafe-eval`, **no** `ws:`, **no** `wss:` — those
are dev-only relaxations. There must be **no** `X-Robots-Tag` on production.

### SEO endpoints

```bash
curl -i https://<production-domain>/sitemap.xml
curl -i https://<production-domain>/robots.txt
curl -i https://<production-domain>/feed.xml
curl -i https://<production-domain>/llms.txt
```

Read the actual URLs inside, not just the status code. Every absolute URL must
be the production origin — no `rinshad.dev`, no `localhost`, no deployment-
specific preview hostname.

### Pages and OG images

All of `/`, `/work`, `/about`, `/blog`, `/contact`, `/uses`, each
`/work/<slug>`, each `/blog/<slug>`, plus `/opengraph-image` and
`/work/<slug>/opengraph-image` (both `image/png`).

Open the site in a real browser: React must hydrate, Framer Motion elements must
appear, and the console must show no CSP violation.

### Contact form — the one that matters

Submit the real form through the browser UI on the production site, then:

1. Check the UI success state.
2. Check the Vercel function logs for the invocation.
3. Check **rinshad803@gmail.com** — Inbox, **Spam**, and **All Mail**.

Sender and recipient are the same Gmail account, so Gmail may file it somewhere
other than the Inbox. The subject is prefixed `[Portfolio] `.

If nothing arrives, read the function logs before touching code. Look for
`[contact] honeypot tripped` — if a password manager or the browser autofilled
the hidden `hp_field`, the message is dropped silently and returns 200. The
field is off-screen, `aria-hidden`, `tabIndex={-1}`, `autoComplete="off"`, and
carries `data-lpignore` / `data-1p-ignore` / `data-form-type="other"` precisely
to prevent this — but verify rather than assume.

Otherwise distinguish: env var missing, SMTP auth (`535`), connection, timeout,
rate limit (429), validation (422), runtime (500).

### Lighthouse

Run it against the deployed production URL, never `next dev` or localhost.

---

## 8. Later: moving to rinshad.dev

1. Register the domain and add it in Vercel; set it as the primary production
   domain and pick the apex/`www` behaviour.
2. Change `NEXT_PUBLIC_SITE_URL` to `https://rinshad.dev`.
3. Redeploy — canonicals, OG, sitemap, robots, feed, JSON-LD and `/llms.txt`
   all follow automatically. No code change.
4. Update `docs/crossposts/*.md`, which still carry `rinshad.dev` links on
   purpose: they are drafts for external publication and are the one place the
   future domain is the correct thing to write.
5. Only then consider HSTS preload submission.
