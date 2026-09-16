import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiError, GoogleGenAI, type Content } from "@google/genai";
import { answerFrames, type SearchCode } from "@/lib/chat/answer";
import {
  encodeFrame,
  MAX_HISTORY_CHARS,
  MAX_MESSAGE_CHARS,
  MAX_MESSAGES,
  MAX_QUESTION_CHARS,
  NDJSON_CONTENT_TYPE,
  type Frame,
  type ServerErrorCode,
  type Source,
} from "@/lib/chat/protocol";
import { buildCorpus, renderCorpusForPrompt } from "@/lib/rag/corpus";
import { embedQuery } from "@/lib/rag/embed";
import { isCodeSearchConfigured, retrieve, RETRIEVAL } from "@/lib/rag/retrieve";
import { buildSystemInstruction } from "@/lib/rag/system-prompt";
import { createRateLimiter, clientKey } from "@/lib/server/rate-limit";

/* ============================================================================
   POST /api/chat — the portfolio assistant. The second endpoint on the site
   that spends money: every question is billed against one Gemini API key,
   and with code search a single question can be several provider calls. So
   it gets the contact form's controls (validation, a per-IP rate limit) plus
   its own: hard caps on history size, at most three code searches per
   question, one deadline for the whole answer, and a real upstream abort
   when the visitor presses Stop.

   Grounding has two tiers. The site corpus (~15k tokens) rides in the system
   prompt on every request — see lib/rag/corpus.ts. The code of the three
   public repositories (~550k tokens) is far too large for that, so the model
   searches it on demand through the searchCode tool (lib/chat/answer.ts →
   lib/rag/retrieve.ts). The response is NDJSON frames, defined in
   lib/chat/protocol.ts and shared with the widget.
   ========================================================================== */

const message = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
});

const schema = z.object({
  messages: z
    .array(message)
    .min(1)
    .max(MAX_MESSAGES)
    .refine((messages) => messages.at(-1)?.role === "user", "The last message must be the question.")
    .refine(
      (messages) => (messages.at(-1)?.content.length ?? 0) <= MAX_QUESTION_CHARS,
      `The question must be ${MAX_QUESTION_CHARS} characters or fewer.`,
    )
    .refine(
      (messages) => messages.reduce((total, m) => total + m.content.length, 0) <= MAX_HISTORY_CHARS,
      "The conversation is too long.",
    ),
});

/* The Gemini SDK and the Neon driver need Node APIs, and streaming does not
   need Edge. 'nodejs' is already the default; pinned so a future default
   can't move the route. */
export const runtime = "nodejs";

/* Function budget must outlast the answer's own deadline, or the platform
   kills the invocation before the handler can write its error frame. An
   answer can be up to five model turns (three searches, one refused
   over-limit request, the reply) plus up to three retrievals, each bounded —
   25s per model call, 10s per search including a cold Neon compute waking.
   Rather than stack those worst cases, the whole answer shares one deadline
   (ANSWER_DEADLINE_MS, 55s), and 60s leaves five for the handler to report
   it. A typical answer — one search, two turns — lands well inside 15s. Still
   far below Vercel's 300s default: a wedged upstream should cost a minute,
   not five. */
export const maxDuration = 60;

const MODEL = "gemini-2.5-flash";
/** Per model call. The SDK keeps it armed while the body streams, so it bounds a whole turn. */
const UPSTREAM_TIMEOUT_MS = 25_000;
/** The whole answer, however many turns and searches it takes. */
const ANSWER_DEADLINE_MS = 55_000;

const GENERATION = {
  temperature: 0.2,
  maxOutputTokens: 1024,
  // Thinking adds seconds before the first token and bills thought tokens;
  // answering from supplied text and retrieved code doesn't need it.
  thinkingConfig: { thinkingBudget: 0 },
};

const limiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  // One question can now cost up to ~8 provider calls (three query embeddings
  // and five model turns) rather than one. Eight questions in ten minutes is
  // still plenty for someone reading the answers, and caps one address at
  // ~64 calls per window instead of ~160. Per warm instance — see
  // lib/server/rate-limit.ts.
  max: 8,
});

/* ----------------------------------------------------------------------------
   Grounding — built once per server instance, from the same content the pages
   render. Deterministic, so every request sends a byte-identical prefix.
   -------------------------------------------------------------------------- */

let corpus: { text: string; sources: Map<string, Omit<Source, "id">> } | null = null;

function getCorpus() {
  if (!corpus) {
    const chunks = buildCorpus();
    // getAllPosts() returns [] when content/blog is missing, which would drop
    // every article from the assistant without an error. next.config.ts traces
    // the directory into this function; this is the alarm if that ever breaks.
    if (process.env.NODE_ENV === "production" && !chunks.some((chunk) => chunk.kind === "blog")) {
      console.error("[chat] corpus has no blog chunks — is content/blog in the function bundle?");
    }
    corpus = {
      text: renderCorpusForPrompt(chunks),
      sources: new Map(chunks.map((chunk) => [chunk.id, { title: chunk.title, url: chunk.sourceUrl }])),
    };
  }
  return corpus;
}

const prompts = new Map<boolean, string>();

function systemInstructionFor(codeSearch: boolean): string {
  let prompt = prompts.get(codeSearch);
  if (!prompt) {
    prompt = buildSystemInstruction(getCorpus().text, { codeSearch });
    prompts.set(codeSearch, prompt);
  }
  return prompt;
}

let client: { apiKey: string; ai: GoogleGenAI } | null = null;

function gemini(apiKey: string): GoogleGenAI {
  if (client?.apiKey !== apiKey) client = { apiKey, ai: new GoogleGenAI({ apiKey }) };
  return client.ai;
}

/* ----------------------------------------------------------------------------
   Responses — every body is NDJSON, errors included, so the widget has exactly
   one parser. Provider and database errors are logged here, never forwarded.
   -------------------------------------------------------------------------- */

const STREAM_HEADERS = {
  "Content-Type": NDJSON_CONTENT_TYPE,
  "Cache-Control": "no-store",
  // Stops Nginx (the self-hosting setup) from buffering the stream into one blob.
  "X-Accel-Buffering": "no",
};

function errorResponse(code: ServerErrorCode, status: number, headers?: Record<string, string>) {
  return new Response(encodeFrame({ type: "error", code }), {
    status,
    headers: { ...STREAM_HEADERS, ...headers },
  });
}

/** Gemini's free-tier and project quotas both surface as HTTP 429. */
const isQuotaError = (err: unknown) => err instanceof ApiError && err.status === 429;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("bad_request", 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) return errorResponse("invalid_request", 422);

  const { ok, retryAfter } = limiter.check(clientKey(req.headers));
  if (!ok) return errorResponse("rate_limited", 429, { "Retry-After": String(retryAfter) });

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error("[chat] GEMINI_API_KEY is not set — the assistant is offline.");
    return errorResponse("unavailable", 503);
  }

  const ai = gemini(apiKey);
  // Without a database the assistant still answers from the site; it just
  // isn't offered the tool.
  const codeSearch = isCodeSearchConfigured();

  /* Cancellation has two doors, and both must abort upstream work. A
     disconnecting browser can surface as `req.signal` aborting, or as the
     response body being cancelled — which one depends on the server in front
     of us. Both feed one signal, which reaches every Gemini call and every
     Neon query, so upstream requests are torn down rather than drained into
     the void. (Per the SDK: aborting stops a request client-side; Google may
     still bill tokens it had already generated.) The deadline is folded in. */
  const local = new AbortController();
  const deadline = AbortSignal.timeout(ANSWER_DEADLINE_MS);
  const signal = AbortSignal.any([req.signal, local.signal, deadline]);
  const stopped = () => req.signal.aborted || local.signal.aborted;

  const searchCode: SearchCode | undefined = codeSearch
    ? ({ query, repo }, searchSignal) =>
        retrieve(query, {
          repo,
          signal: searchSignal,
          embed: (text, embedSignal) => embedQuery(ai, text, { signal: embedSignal, timeoutMs: RETRIEVAL.timeoutMs }),
        })
    : undefined;

  const frames = answerFrames({
    ai,
    model: MODEL,
    config: {
      ...GENERATION,
      systemInstruction: systemInstructionFor(codeSearch),
      // No retryOptions: the SDK only retries when asked, and retrying a 429
      // would spend the visitor's wait on a quota that is already gone.
      httpOptions: { timeout: UPSTREAM_TIMEOUT_MS },
    },
    contents: parsed.data.messages.map(
      (m): Content => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }),
    ),
    sources: getCorpus().sources,
    searchCode,
    signal,
  });

  /* Wait for the first frame before answering the browser. Quota, auth and
     model errors all happen here, and this is the last moment they can still
     become real HTTP statuses instead of a 200 with bad news. */
  let first: IteratorResult<Frame, void>;
  try {
    first = await frames.next();
  } catch (err) {
    local.abort();
    // Nobody is listening (nginx's "client closed request").
    if (req.signal.aborted) return new Response(null, { status: 499 });
    if (isQuotaError(err)) {
      console.warn("[chat] Gemini quota exhausted");
      return errorResponse("quota", 429);
    }
    console.error("[chat] Gemini request failed", err);
    return errorResponse("upstream", 502);
  }

  const encoder = new TextEncoder();
  let pending: IteratorResult<Frame, void> | null = first;

  /* Pull-based: the model and the database are only read as fast as the
     browser reads us. */
  const responseBody = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const result = pending ?? (await frames.next());
        pending = null;
        if (result.done) {
          controller.close();
          return;
        }
        controller.enqueue(encoder.encode(encodeFrame(result.value)));
      } catch (err) {
        if (stopped()) {
          // Stopped by the visitor: no error to report, and possibly no
          // stream left to report it on.
          try {
            controller.close();
          } catch {}
          return;
        }
        const quota = isQuotaError(err);
        if (deadline.aborted) console.error("[chat] answer passed its deadline");
        else if (!quota) console.error("[chat] answer failed mid-stream", err);
        controller.enqueue(encoder.encode(encodeFrame({ type: "error", code: quota ? "quota" : "upstream" })));
        controller.close();
      }
    },

    cancel() {
      local.abort();
      void frames.return(undefined).catch(() => {});
    },
  });

  return new Response(responseBody, { headers: STREAM_HEADERS });
}
