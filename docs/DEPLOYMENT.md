# Deployment — Vercel

First deploy of a site that has never been deployed.

`rinshad.dev` is not registered (NXDOMAIN), so the canonical domain is the
project's `*.vercel.app` hostname for now. Switching later is one env var.

---

## 1. Create the project

Import `github.com/MohdRinshadmi/rinshad-portfolio`. Framework preset
**Next.js**. Leave build/install/output settings on their defaults.

Don't add `output: "export"` or `standalone` — `/api/contact` needs a real
serverless function.

## 2. Environment variables

| Variable | Value | Environments |
| --- | --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` | Production, Preview |
| `SMTP_PORT` | `465` | Production, Preview |
| `SMTP_USER` | `rinshad803@gmail.com` | Production, Preview |
| `SMTP_PASS` | *Gmail App Password* | Production, Preview |
| `CONTACT_EMAIL` | `rinshad803@gmail.com` | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-project>.vercel.app` | Production only |

**`SMTP_PASS`** — paste the secret only, **no quotes**. It must be an App
Password, not the account password, or Gmail returns `535`.

**`NEXT_PUBLIC_SITE_URL`** — no trailing slash. Leave it unset on Preview so
previews emit production canonicals instead of self-canonicalising.

## 3. Dashboard settings

- **Node.js Version** → 22.x (optional; `engines` in `package.json` already
  pins it and overrides the dashboard).
- **Functions → Region** → Mumbai `bom1`. Must be set here, not in code —
  Vercel only honours `preferredRegion` on the edge runtime.

## 4. Deploy

Push the branch and promote to production. Record the commit SHA and URL.

---

## 5. Verify against the live URL

A green deploy proves nothing on its own.

```bash
curl -sI https://<domain>/            # headers
curl -i  https://<domain>/sitemap.xml
curl -i  https://<domain>/robots.txt
curl -i  https://<domain>/feed.xml
curl -i  https://<domain>/llms.txt
```

- Headers present: CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Cross-Origin-Resource-Policy`, `Permissions-Policy`.
- CSP must contain **no** `unsafe-eval`, `ws:` or `wss:`.
- Production must have **no** `X-Robots-Tag` (previews should have it).
- Read the URLs *inside* those files — all must be the production origin, with
  no `rinshad.dev`, `localhost`, or preview hostname.

Then in a browser: every page loads, React hydrates (animations run), console
shows no CSP violations. Check `/opengraph-image` and one
`/work/<slug>/opengraph-image` return PNGs.

Finally run Lighthouse against the deployed URL — never localhost.

## 6. Contact form

Submit the real form on the live site, then check **rinshad803@gmail.com** —
Inbox, **Spam**, and **All Mail**. Sender and recipient are the same account, so
Gmail may not file it in the Inbox. Subject is prefixed `[Portfolio] `.

If nothing arrives, read the Vercel function logs before changing any code. In
particular look for `[contact] honeypot tripped` — if something autofilled the
hidden field, the message is dropped silently and still returns 200.

---

## Later: moving to rinshad.dev

1. Register it, add it in Vercel, make it the primary production domain.
2. Set `NEXT_PUBLIC_SITE_URL=https://rinshad.dev`.
3. Redeploy. Canonicals, OG, sitemap, robots, feed, JSON-LD and `/llms.txt` all
   follow automatically — no code change.
4. Update the `rinshad.dev` links in `docs/crossposts/*.md`.
5. Only then consider HSTS preload submission (slow to undo).
