import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendContactMail } from "@/lib/server/mail";
import { createRateLimiter, clientKey } from "@/lib/server/rate-limit";

/* ============================================================================
   POST /api/contact — the only write endpoint on the site, and the only thing
   here that spends money (SMTP quota) and attention (the inbox). It therefore
   gets the two controls a public contact form always needs: a honeypot to
   absorb naive bots, and a per-IP rate limit to stop anyone from turning the
   form into a mail cannon.
   ========================================================================== */

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.email().max(200),
  subject: z.string().min(4).max(200),
  message: z.string().min(20).max(5000),
  /** Honeypot — hidden from humans, irresistible to form-filling bots.
      Optional so a legitimate client that omits it entirely still passes.
      Deliberately NOT named after a real field: "company" was autofilled by
      Chrome from the saved address profile, so genuine messages were dropped. */
  hp_field: z.string().max(200).optional(),
});

/* Nodemailer opens a raw TCP+TLS socket to the SMTP server, which the Edge
   runtime has no API for. 'nodejs' is already the default, but it is pinned
   explicitly so that adding an Edge-defaulting config (or a future default
   change) can't silently move this route and break mail at runtime. */
export const runtime = "nodejs";

/* Function budget must outlast the SMTP budget, or the platform kills the
   invocation before the catch block can log the failure and answer the browser.
   Nodemailer's worst case here is connectionTimeout (10s) + greetingTimeout
   (10s) + one stalled socketTimeout phase (15s) = ~35s, so 60s leaves headroom
   for nodemailer to raise its own error and for this handler to return 500.
   It is also deliberately well BELOW Vercel's 300s default: a wedged SMTP
   connection should fail in a minute, not bill five. */
export const maxDuration = 60;

/* Note: `preferredRegion` is NOT set here. Vercel only honours it for
   `runtime = 'edge'` and throws on an unsupported value, so the execution
   region for this Node function is a project-level setting instead. */

const limiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  // Generous enough that an office behind one NAT address — or the owner
  // testing the form — doesn't get blocked, tight enough that nobody turns
  // this into a mail cannon.
  max: 10,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Honeypot tripped: answer 200 so the bot records a success and moves on,
    // and send nothing. Telling it the truth only invites a retry.
    // Logged, because the cost of a false positive here is a lost job lead —
    // if real messages go missing, this line is the evidence.
    if (data.hp_field) {
      console.warn(
        `[contact] honeypot tripped, message dropped — from "${data.email}". ` +
          `If this was a real person, the trap is being autofilled.`,
      );
      return NextResponse.json({ ok: true });
    }

    const { ok, retryAfter } = limiter.check(clientKey(req.headers));
    if (!ok) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later or email directly." },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    await sendContactMail(data);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }
    console.error("[contact]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
