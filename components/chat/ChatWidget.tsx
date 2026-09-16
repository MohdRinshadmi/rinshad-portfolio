"use client";

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, ArrowUp, ArrowUpRight, RotateCcw, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config/site";
import { DURATION, EASE, staggerContainerFast } from "@/lib/animation";
import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  createFrameDecoder,
  MAX_HISTORY_CHARS,
  MAX_MESSAGE_CHARS,
  MAX_MESSAGES,
  MAX_QUESTION_CHARS,
  parseFrame,
  ProtocolError,
  segmentAnswer,
  toAnswerBlocks,
  type Frame,
  type ServerErrorCode,
  type Source,
  type WireMessage,
} from "@/lib/chat/protocol";

/* ============================================================================
   THE PORTFOLIO ASSISTANT — panel, conversation, and the stream behind it.

   Lazy by construction: ChatLauncher imports this through next/dynamic, so none
   of it ships until a visitor reaches for the launcher. It only ever talks to
   /api/chat — never to Gemini, never to the corpus.

   Every answer moves through seven states rather than an `isLoading` flag.
   "Loading" isn't one moment in a streaming UI: a partial answer, a stopped
   answer and an answer that died at token 400 are all things a visitor looks
   at, and each needs its own rendering and its own rule for what to keep.
   ========================================================================== */

/** The seven states of one answer. */
export type ChatState =
  | { status: "queued" }
  | { status: "streaming" }
  /* A `tool` frame: the server is running searchCode. Its done/error frame
     moves the answer back to `streaming` while the model reads the results. */
  | { status: "tool-running"; tool: string; query: string }
  | { status: "cancelled" }
  | { status: "error"; code: ChatErrorCode }
  | { status: "quota-exhausted" }
  | { status: "complete" };

type ChatErrorCode = Exclude<ServerErrorCode, "quota"> | "network" | "interrupted";

type Settled = Extract<ChatState, { status: "cancelled" | "error" | "quota-exhausted" | "complete" }>;

type UserMessage = { id: string; role: "user"; content: string };
/** One searchCode call behind an answer, as its tool frames reported it. */
type ToolActivity = { query: string; repo?: string; status: "running" | "done" | "error"; results?: number };
type AssistantMessage = {
  id: string;
  role: "assistant";
  /** Raw answer text, citation markers included — rendered safely, sent back as history. */
  content: string;
  /** Resolved by the server, in order of first citation. */
  sources: Source[];
  /** Code searches made while answering, in order. */
  tools: ToolActivity[];
  state: ChatState;
};
type Message = UserMessage | AssistantMessage;

const isActive = (state: ChatState) =>
  state.status === "queued" || state.status === "streaming" || state.status === "tool-running";

/* ----------------------------------------------------------------------------
   State machine
   -------------------------------------------------------------------------- */

type Action =
  | { type: "ask"; question: UserMessage; answerId: string; retry: boolean }
  | { type: "frames"; id: string; frames: Frame[] }
  | { type: "settle"; id: string; state: Settled };

function applyFrame(answer: AssistantMessage, frame: Frame): AssistantMessage {
  // An earlier frame in the same batch may already have ended the answer.
  if (!isActive(answer.state)) return answer;

  switch (frame.type) {
    case "token":
      return { ...answer, content: answer.content + frame.text, state: { status: "streaming" } };
    case "source":
      return answer.sources.some((source) => source.id === frame.id)
        ? answer
        : { ...answer, sources: [...answer.sources, { id: frame.id, title: frame.title, url: frame.url }] };
    case "tool":
      if (frame.status === "running") {
        return {
          ...answer,
          tools: [...answer.tools, { query: frame.query, repo: frame.repo, status: "running" }],
          state: { status: "tool-running", tool: frame.name, query: frame.query },
        };
      }
      return {
        ...answer,
        tools: answer.tools.map((tool, index) =>
          index === answer.tools.length - 1 && tool.status === "running"
            ? { ...tool, status: frame.status, results: frame.status === "done" ? frame.results : undefined }
            : tool,
        ),
        state: { status: "streaming" },
      };
    case "done":
      return { ...answer, state: { status: "complete" } };
    case "error":
      return {
        ...answer,
        state: frame.code === "quota" ? { status: "quota-exhausted" } : { status: "error", code: frame.code },
      };
  }
}

/** Updates one in-flight answer. A settled answer is final: a frame that
    arrives after Stop, or a second settle, changes nothing. */
function updateAnswer(messages: Message[], id: string, update: (answer: AssistantMessage) => AssistantMessage) {
  const index = messages.findLastIndex((message) => message.id === id);
  const target = messages[index];
  if (!target || target.role !== "assistant" || !isActive(target.state)) return messages;

  const next = update(target);
  if (next === target) return messages;
  const copy = messages.slice();
  copy[index] = next;
  return copy;
}

function reducer(messages: Message[], action: Action): Message[] {
  switch (action.type) {
    case "ask": {
      // A retry replaces the failed question and its answer rather than repeating them.
      const base = action.retry ? messages.slice(0, -2) : messages;
      const answer: AssistantMessage = {
        id: action.answerId,
        role: "assistant",
        content: "",
        sources: [],
        tools: [],
        state: { status: "queued" },
      };
      return [...base, action.question, answer];
    }
    case "frames":
      return updateAnswer(messages, action.id, (answer) => action.frames.reduce(applyFrame, answer));
    case "settle":
      return updateAnswer(messages, action.id, (answer) => ({ ...answer, state: action.state }));
  }
}

/**
 * The history sent with a question, newest turns first until a limit is hit.
 * A question whose answer never arrived is left out — sending it would put
 * two user turns in a row. A stopped answer's partial text is kept: it is
 * what the visitor saw.
 */
function toWireHistory(messages: Message[], question: string): WireMessage[] {
  const pairs: [WireMessage, WireMessage][] = [];
  for (let i = 0; i + 1 < messages.length; i += 2) {
    const [asked, answered] = [messages[i], messages[i + 1]];
    if (asked.role === "user" && answered.role === "assistant" && answered.content.trim()) {
      pairs.push([
        { role: "user", content: asked.content },
        { role: "assistant", content: answered.content.slice(0, MAX_MESSAGE_CHARS) },
      ]);
    }
  }

  const kept: WireMessage[] = [];
  let chars = question.length;
  for (let i = pairs.length - 1; i >= 0; i--) {
    const [asked, answered] = pairs[i];
    const size = asked.content.length + answered.content.length;
    if (kept.length + 3 > MAX_MESSAGES || chars + size > MAX_HISTORY_CHARS) break;
    kept.unshift(asked, answered);
    chars += size;
  }

  return [...kept, { role: "user", content: question }];
}

/** Why a request failed before streaming — from its error frame when there is one. */
async function failureOf(res: Response): Promise<Settled> {
  let code: ServerErrorCode | null = null;
  try {
    const frame = parseFrame((await res.text()).split("\n", 1)[0]);
    if (frame?.type === "error") code = frame.code;
  } catch (err) {
    // An abort mid-read is a Stop, not a failure — let the caller see it.
    if (!(err instanceof ProtocolError)) throw err;
  }
  // No frame: a proxy or platform answered instead of the route.
  code ??= res.status === 429 ? "rate_limited" : res.status === 503 ? "unavailable" : "upstream";
  return code === "quota" ? { status: "quota-exhausted" } : { status: "error", code };
}

/* ----------------------------------------------------------------------------
   Copy
   -------------------------------------------------------------------------- */

/** Every one is answered from the corpus: experience, the AI FAQ, the three
    case studies, and the availability line. */
const SUGGESTIONS = [
  "What does Rinshad own in production?",
  "What has he built with AI and RAG?",
  "Walk me through his projects",
  "Is he open to remote roles or relocation?",
] as const;

const ERROR_COPY: Record<ChatErrorCode, string> = {
  rate_limited: "That's a lot of questions in a short window. Give it a few minutes, then try again.",
  invalid_request: "That message couldn't be sent. Try a shorter question.",
  bad_request: "That message couldn't be sent. Try a shorter question.",
  unavailable: "The assistant is offline right now. Everything it knows is on this site.",
  upstream: "The model didn't answer this time. Try again in a moment.",
  network: "Couldn't reach the assistant. Check your connection and try again.",
  interrupted: "The answer was cut off on the way back. Try again.",
};

const QUOTA_COPY = "The assistant has reached its usage limit for now.";

function announcement(message: Message | undefined): string {
  if (message?.role !== "assistant") return "";
  const { state } = message;
  switch (state.status) {
    case "queued":
      return "Thinking…";
    case "streaming":
      return "Answering…";
    case "tool-running":
      return "Searching the code…";
    case "complete":
      return "Answer ready.";
    case "cancelled":
      return "Stopped.";
    case "error":
      return ERROR_COPY[state.code];
    case "quota-exhausted":
      return QUOTA_COPY;
  }
}

/* ----------------------------------------------------------------------------
   Motion — the site's tokens; opacity-only variants under reduced motion.
   -------------------------------------------------------------------------- */

/* The panel is never unmounted, so "hidden" is both its starting state and its
   closing animation. A closed panel is also `inert` and pointer-transparent, so
   it takes no focus, clicks or screen-reader attention. It deliberately never
   gets `visibility: hidden`: focus moves into the panel in the same commit that
   opens it, before an animation frame could make it visible again. */
const desktopPanel: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.97,
    y: 10,
    transition: { duration: DURATION.fast, ease: EASE.out },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { ...EASE.spring, opacity: { duration: DURATION.base, ease: EASE.out } },
  },
};

const mobilePanel: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    transition: { duration: DURATION.fast, ease: EASE.out },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...EASE.spring, opacity: { duration: DURATION.base, ease: EASE.out } },
  },
};

const reducedPanel: Variants = {
  hidden: { opacity: 0, transition: { duration: DURATION.fast } },
  visible: { opacity: 1, transition: { duration: DURATION.fast } },
};

const suggestionItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE.out } },
};

/* ----------------------------------------------------------------------------
   Viewport — Tailwind's `md` is where the panel stops being a full screen.
   -------------------------------------------------------------------------- */

const MOBILE_QUERY = "(max-width: 47.99rem)";

function subscribeMobile(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** The visual viewport is what shrinks when the on-screen keyboard opens —
    `100dvh` does not on iOS, which is how an input ends up under the keyboard. */
function subscribeViewport(onChange: () => void) {
  const viewport = window.visualViewport;
  viewport?.addEventListener("resize", onChange);
  viewport?.addEventListener("scroll", onChange);
  return () => {
    viewport?.removeEventListener("resize", onChange);
    viewport?.removeEventListener("scroll", onChange);
  };
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])';

/* ----------------------------------------------------------------------------
   Widget
   -------------------------------------------------------------------------- */

interface ChatWidgetProps {
  open: boolean;
  onClose: () => void;
}

export function ChatWidget({ open, onClose }: ChatWidgetProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const isMobile = useSyncExternalStore(subscribeMobile, () => window.matchMedia(MOBILE_QUERY).matches, () => false);
  const viewportHeight = useSyncExternalStore(
    subscribeViewport,
    () => window.visualViewport?.height ?? window.innerHeight,
    () => 0,
  );
  const viewportTop = useSyncExternalStore(subscribeViewport, () => window.visualViewport?.offsetTop ?? 0, () => 0);

  const [messages, dispatch] = useReducer(reducer, []);
  const [draft, setDraft] = useState("");

  const messagesRef = useRef(messages);
  const controllerRef = useRef<AbortController | null>(null);
  const idRef = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pinnedRef = useRef(true);

  const titleId = useId();
  const inputId = useId();
  const hintId = useId();

  const last = messages.at(-1);
  const busy = last?.role === "assistant" && isActive(last.state);
  const canSend = !busy && draft.trim().length > 0;

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // A widget that goes away mid-answer takes its request with it.
  useEffect(() => {
    const controllers = controllerRef;
    return () => controllers.current?.abort();
  }, []);

  const ask = useCallback(async (raw: string, { retry = false }: { retry?: boolean } = {}) => {
    const question = raw.trim().slice(0, MAX_QUESTION_CHARS);
    if (!question || controllerRef.current) return;

    const history = retry ? messagesRef.current.slice(0, -2) : messagesRef.current;
    const answerId = `m${++idRef.current}`;
    const controller = new AbortController();
    controllerRef.current = controller;
    pinnedRef.current = true;

    dispatch({ type: "ask", question: { id: `m${++idRef.current}`, role: "user", content: question }, answerId, retry });
    const settle = (state: Settled) => dispatch({ type: "settle", id: answerId, state });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: toWireHistory(history, question) }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        settle(await failureOf(res));
        return;
      }

      const decoder = createFrameDecoder();
      const reader = res.body.getReader();
      for (;;) {
        const { value, done } = await reader.read();
        // One dispatch per network read, however many frames it carried.
        const frames = done ? decoder.flush() : decoder.push(value);
        if (frames.length > 0) dispatch({ type: "frames", id: answerId, frames });
        if (done) break;
      }

      // Closed without `done` or `error`: cut off in transit. A no-op when a
      // frame already settled the answer.
      settle({ status: "error", code: "interrupted" });
    } catch (err) {
      settle(
        controller.signal.aborted
          ? { status: "cancelled" }
          : { status: "error", code: err instanceof ProtocolError ? "interrupted" : "network" },
      );
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  /** Stop keeps everything already on screen — see the `cancelled` state. */
  const stop = useCallback(() => controllerRef.current?.abort(), []);

  const retry = useCallback(() => {
    const question = messagesRef.current.findLast((message) => message.role === "user");
    if (question) void ask(question.content, { retry: true });
  }, [ask]);

  const submit = () => {
    if (!canSend) return;
    void ask(draft);
    setDraft("");
  };

  /* Focus, Escape and — on phones, where the panel is a full-screen modal — a
     focus trap and body scroll lock, matching MobileMenu. On desktop the panel
     is non-modal: the page stays usable beside it. */
  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Phones get the close button, not the input — focusing the input would
    // throw the keyboard over the suggestions before anyone has read them.
    (isMobile ? closeRef : inputRef).current?.focus({ preventScroll: true });

    if (!isMobile) return () => opener?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    const { overflow, paddingRight } = document.body.style;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      opener?.focus({ preventScroll: true });
    };
  }, [open, isMobile]);

  // Follow the answer as it streams — unless the reader has scrolled up to reread.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (list && pinnedRef.current) list.scrollTop = list.scrollHeight;
  }, [messages, open]);

  // The input grows with its text, up to five lines.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 128)}px`;
  }, [draft, open]);

  const onNavigate = isMobile ? onClose : undefined;
  const panelVariants = reduceMotion ? reducedPanel : isMobile ? mobilePanel : desktopPanel;

  return (
    <motion.div
      id="chat-panel"
      ref={panelRef}
      role="dialog"
      aria-modal={isMobile ? true : undefined}
      aria-labelledby={titleId}
      // Mounted once and toggled rather than unmounted: an AnimatePresence exit
      // intermittently never completed (4 of 6 Escape closes in a browser run),
      // leaving an invisible panel over the page. `inert` takes a closed panel
      // out of the tab order, hit-testing and the accessibility tree.
      inert={!open}
      variants={panelVariants}
      initial="hidden"
      animate={open ? "visible" : "hidden"}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
      style={isMobile && viewportHeight > 0 ? { top: viewportTop, height: viewportHeight } : undefined}
      className={cn(
        "fixed z-65 flex flex-col overflow-hidden bg-surface text-text",
        // Phones: the whole screen, sized to the visual viewport (see above).
        "inset-x-0 top-0 h-dvh",
        // Desktop: a floating panel anchored above the launcher.
        "md:top-auto md:left-auto md:bottom-20 md:right-6 md:h-[min(40rem,calc(100dvh-7rem))] md:w-100",
        "md:origin-bottom-right md:rounded-xl md:border md:border-border md:shadow-raised",
        !open && "pointer-events-none",
      )}
    >
      {/* Header — identity + close */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-5 md:pt-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-text font-display text-[0.9375rem] font-semibold tracking-tight text-bg"
          >
            {siteConfig.name.charAt(0)}
            <span className="text-accent">.</span>
          </span>
          <div className="min-w-0">
            <h2
              id={titleId}
              className="truncate font-display text-[0.9375rem] font-semibold leading-tight tracking-tight text-text"
            >
              Ask about {siteConfig.name}
            </h2>
            <p className="mt-0.5 truncate text-xs text-text-tertiary">Answers from this site only</p>
          </div>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close the assistant"
          className="-mr-1.5 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors duration-200 ease-out hover:bg-text/5 hover:text-text md:size-9"
        >
          <X size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      {/* Conversation. data-lenis-prevent: Lenis owns the page's wheel
          events, and would otherwise scroll the page instead of this list. */}
      <div
        ref={listRef}
        data-lenis-prevent
        onScroll={(event) => {
          const list = event.currentTarget;
          pinnedRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 48;
        }}
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 md:px-5"
      >
        {messages.length === 0 ? (
          <Welcome open={open} onAsk={ask} />
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DURATION.base, ease: EASE.out }}
              >
                {message.role === "user" ? (
                  <UserBubble content={message.content} />
                ) : (
                  <AssistantAnswer
                    message={message}
                    isLast={index === messages.length - 1}
                    reduceMotion={reduceMotion}
                    onRetry={retry}
                    onNavigate={onNavigate}
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* State changes only — never the token stream, which would read
          every fragment aloud as it arrives. */}
      <p role="status" className="sr-only">
        {announcement(last)}
      </p>

      {/* Composer */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className="shrink-0 border-t border-border px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:px-5 md:pb-3"
      >
        <label htmlFor={inputId} className="sr-only">
          Ask a question about {siteConfig.name}
        </label>
        {/* The ring lives on the wrapper so it frames the button too; the
            textarea's own outline is replaced by it, not removed. */}
        <div className="flex items-end gap-2 rounded-lg border border-border bg-surface-raised p-1.5 pl-3.5 transition-[border-color,box-shadow] duration-200 ease-out focus-within:border-accent-text focus-within:ring-2 focus-within:ring-accent/60">
          <textarea
            ref={inputRef}
            id={inputId}
            rows={1}
            value={draft}
            maxLength={MAX_QUESTION_CHARS}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Ask about his work, projects or stack…"
            aria-describedby={hintId}
            // Inline, not `outline-none`: the site-wide `:focus-visible` ring
            // is unlayered CSS, which beats every Tailwind utility and drew
            // a second, square ring inside the wrapper's rounded one.
            style={{ outline: "none" }}
            className="max-h-32 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm leading-snug text-text placeholder:text-text-tertiary"
          />
          {/* One button that changes role, not two that swap: keyboard focus
              survives the send → stop → send cycle. */}
          <button
            type="button"
            onClick={busy ? stop : submit}
            aria-label={busy ? "Stop generating" : "Send question"}
            aria-disabled={!busy && !canSend}
            className={cn(
              "relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors duration-200 ease-out md:size-9",
              busy || canSend
                ? "bg-text text-bg hover:bg-accent-press"
                : "cursor-default bg-bg-subtle text-text-tertiary",
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={busy ? "stop" : "send"}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: DURATION.micro, ease: EASE.out }}
                className="inline-flex"
                aria-hidden="true"
              >
                {busy ? (
                  <Square size={11} fill="currentColor" strokeWidth={0} />
                ) : (
                  <ArrowUp size={16} strokeWidth={2.25} />
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
        <div id={hintId} className="mt-2 flex items-center justify-between gap-3 px-1 text-[0.6875rem] text-text-tertiary">
          <span>Grounded in this site · AI can make mistakes</span>
          {draft.length > MAX_QUESTION_CHARS * 0.8 && (
            <span className="font-mono tabular-nums">
              {draft.length}/{MAX_QUESTION_CHARS}
            </span>
          )}
        </div>
      </form>
    </motion.div>
  );
}

/* ----------------------------------------------------------------------------
   Pieces
   -------------------------------------------------------------------------- */

function Welcome({ open, onAsk }: { open: boolean; onAsk: (question: string) => void }) {
  return (
    <div className="flex min-h-full flex-col justify-end gap-6 pb-1">
      <div>
        <Eyebrow dot>AI assistant</Eyebrow>
        <p className="mt-4 font-display text-[1.375rem] font-semibold leading-[1.15] tracking-tight text-text">
          Hi — I&apos;m {siteConfig.name}&apos;s AI assistant.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          Ask about his production work, projects, AI experience, or stack. Answers come from this site, with links to
          the pages behind them.
        </p>
      </div>

      <motion.ul
        variants={staggerContainerFast}
        initial="hidden"
        // Replays each time the panel opens: it stays mounted between visits.
        animate={open ? "visible" : "hidden"}
        aria-label="Suggested questions"
        className="flex flex-col gap-2"
      >
        {SUGGESTIONS.map((question) => (
          <motion.li key={question} variants={suggestionItem}>
            <motion.button
              type="button"
              onClick={() => onAsk(question)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.985 }}
              transition={EASE.springSnappy}
              className="group/q flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface-raised px-3.5 py-2.5 text-left text-sm text-text transition-[border-color,box-shadow] duration-200 ease-out hover:border-border-strong hover:shadow-card"
            >
              <span>{question}</span>
              <ArrowRight
                size={15}
                strokeWidth={1.75}
                aria-hidden="true"
                className="shrink-0 text-text-tertiary transition-[color,transform] duration-200 ease-out group-hover/q:translate-x-0.5 group-hover/q:text-accent-text"
              />
            </motion.button>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] whitespace-pre-wrap wrap-break-word rounded-lg rounded-br-sm bg-text px-3.5 py-2.5 text-sm leading-relaxed text-bg">
        {content}
      </p>
    </div>
  );
}

/** Where a source link goes. Same-origin sources become client navigations, so
    the conversation — which lives in the layout — survives the click. */
function resolveSource(url: string): { internal: boolean; href: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.origin === window.location.origin
      ? { internal: true, href: `${parsed.pathname}${parsed.hash}` }
      : { internal: false, href: parsed.href };
  } catch {
    return null;
  }
}

function SourceLink({
  source,
  className,
  label,
  onNavigate,
  children,
}: {
  source: Source;
  className: string;
  label?: string;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  const target = resolveSource(source.url);
  if (!target) return null;

  return target.internal ? (
    <Link href={target.href} onClick={onNavigate} aria-label={label} className={className}>
      {children}
    </Link>
  ) : (
    <a href={target.href} target="_blank" rel="noreferrer" aria-label={label} className={className}>
      {children}
    </a>
  );
}

interface AssistantAnswerProps {
  message: AssistantMessage;
  isLast: boolean;
  reduceMotion: boolean;
  onRetry: () => void;
  onNavigate?: () => void;
}

/** Memoised: while one answer streams, every earlier message keeps its props
    and skips the render. */
const AssistantAnswer = memo(function AssistantAnswer({
  message,
  isLast,
  reduceMotion,
  onRetry,
  onNavigate,
}: AssistantAnswerProps) {
  const { content, sources, state } = message;
  const blocks = toAnswerBlocks(content);
  const numbers = new Map(sources.map((source, index) => [source.id, { source, n: index + 1 }]));
  const active = isActive(state);
  const caret = state.status === "streaming" && !reduceMotion ? <Caret /> : null;

  /** Prose with citation markers turned into numbered links. The model's text
      is only ever a React text node; the only hrefs come from source frames. */
  const inline = (text: string, withCaret: boolean) => {
    const citeLinks = (ids: string[], key: string) =>
      ids.map((id) => {
        const cited = numbers.get(id);
        if (!cited) return null;
        return (
          <SourceLink
            key={`${key}-${id}`}
            source={cited.source}
            label={`Source ${cited.n}: ${cited.source.title}`}
            onNavigate={onNavigate}
            className="ml-0.5 inline-flex h-4 min-w-4 -translate-y-1.5 items-center justify-center rounded-full border border-border bg-surface-raised px-1 align-baseline font-mono text-[0.625rem] leading-none text-text-secondary transition-colors duration-200 ease-out hover:border-accent/40 hover:text-accent-text"
          >
            {cited.n}
          </SourceLink>
        );
      });

    const segments = segmentAnswer(text);
    const nodes: ReactNode[] = [];

    for (let index = 0; index < segments.length; index++) {
      const segment = segments[index];
      if (segment.type === "cite") {
        nodes.push(...citeLinks(segment.ids, `c${index}`));
        continue;
      }

      // Markers that directly follow this text are rendered with it.
      const cites: string[] = [];
      let next = segments[index + 1];
      while (next?.type === "cite") {
        cites.push(...next.ids);
        index++;
        next = segments[index + 1];
      }

      if (cites.length === 0) {
        nodes.push(<span key={index}>{segment.text}</span>);
        continue;
      }

      // A marker must never wrap away from the claim it supports, so the
      // claim's last word and its markers share one unbreakable run.
      const claim = segment.text.trimEnd();
      const lastWord = claim.search(/\S+$/);
      nodes.push(
        <span key={index}>
          {lastWord > 0 && claim.slice(0, lastWord)}
          <span className="whitespace-nowrap">
            {lastWord >= 0 ? claim.slice(lastWord) : claim}
            {citeLinks(cites, `c${index}`)}
          </span>
        </span>,
      );
    }

    return (
      <>
        {nodes}
        {withCaret && caret}
      </>
    );
  };

  return (
    <article aria-busy={active} className="text-[0.9375rem] leading-relaxed text-text">
      {message.tools.length > 0 && <ToolTrace tools={message.tools} reduceMotion={reduceMotion} />}
      {active && blocks.length === 0 && state.status !== "tool-running" && <Pending reduceMotion={reduceMotion} />}

      {blocks.map((block, index) => {
        const lastBlock = index === blocks.length - 1;
        if (block.type === "paragraph") {
          return (
            <p key={index} className="mt-3 first:mt-0">
              {inline(block.text, lastBlock)}
            </p>
          );
        }
        const List = block.ordered ? "ol" : "ul";
        return (
          <List
            key={index}
            className={cn(
              "mt-3 space-y-1.5 pl-5 marker:text-text-tertiary first:mt-0",
              block.ordered ? "list-decimal" : "list-disc",
            )}
          >
            {block.items.map((item, itemIndex) => (
              <li key={itemIndex}>{inline(item, lastBlock && itemIndex === block.items.length - 1)}</li>
            ))}
          </List>
        );
      })}

      {sources.length > 0 && (
        <ul aria-label="Sources" className="mt-3.5 flex flex-wrap gap-1.5">
          {sources.map((source, index) => (
            <li key={source.id} className="max-w-full">
              <SourceLink
                source={source}
                onNavigate={onNavigate}
                className="group/src inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-border bg-surface-raised py-1 pl-1 pr-2.5 text-xs text-text-secondary transition-[color,border-color] duration-200 ease-out hover:border-border-strong hover:text-text"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-bg-subtle font-mono text-[0.625rem] text-text-tertiary transition-colors duration-200 group-hover/src:bg-accent/10 group-hover/src:text-accent-text"
                >
                  {index + 1}
                </span>
                <span className="truncate">{source.title}</span>
                <ArrowUpRight
                  size={12}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="shrink-0 text-text-tertiary transition-transform duration-200 ease-out group-hover/src:-translate-y-px group-hover/src:translate-x-px"
                />
              </SourceLink>
            </li>
          ))}
        </ul>
      )}

      <AnswerNotice state={state} hasContent={blocks.length > 0} isLast={isLast} onRetry={onRetry} />
    </article>
  );
});

function Caret() {
  return (
    <span
      aria-hidden="true"
      className="ml-0.5 inline-block h-[1.05em] w-0.5 translate-y-[0.18em] animate-pulse rounded-full bg-accent"
    />
  );
}

function Pending({ reduceMotion }: { reduceMotion: boolean }) {
  // Reduced motion gets the words instead of the animated dots.
  if (reduceMotion) {
    return <p className="text-sm text-text-tertiary">Thinking…</p>;
  }
  return (
    <div aria-hidden="true" className="flex h-6 items-center gap-1">
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          className="size-1.5 animate-pulse rounded-full bg-text-tertiary"
          style={{ animationDelay: `${dot * 160}ms` }}
        />
      ))}
    </div>
  );
}

/** The searches behind an answer: `searchCode("jwt refresh rotation") → 8 results`. */
function ToolTrace({ tools, reduceMotion }: { tools: ToolActivity[]; reduceMotion: boolean }) {
  return (
    <ul
      aria-label="Code searches"
      className="mb-3 flex flex-col gap-1 border-l border-border pl-3 font-mono text-[0.6875rem] leading-relaxed text-text-tertiary"
    >
      {tools.map((tool, index) => (
        <li key={index} className="min-w-0 wrap-break-word">
          <span className="text-text-secondary">searchCode(</span>
          <span className="text-accent-text">&quot;{tool.query}&quot;</span>
          {tool.repo ? <span className="text-text-secondary">, {tool.repo}</span> : null}
          <span className="text-text-secondary">)</span>
          <span aria-hidden="true"> → </span>
          {tool.status === "running" ? (
            <span className={reduceMotion ? undefined : "animate-pulse"}>searching…</span>
          ) : tool.status === "done" ? (
            <span>
              {tool.results} {tool.results === 1 ? "result" : "results"}
            </span>
          ) : (
            <span>unavailable</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function AnswerNotice({
  state,
  hasContent,
  isLast,
  onRetry,
}: {
  state: ChatState;
  hasContent: boolean;
  isLast: boolean;
  onRetry: () => void;
}) {
  if (state.status === "cancelled") {
    return (
      <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-text-tertiary">
        {hasContent ? "Stopped" : "Stopped before an answer arrived"}
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mt-3 flex items-start justify-between gap-3 rounded-md border border-danger/20 bg-danger/5 px-3.5 py-3">
        <p className="text-sm leading-snug text-text">{ERROR_COPY[state.code]}</p>
        {isLast && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full border border-border-strong bg-surface-raised px-3 text-xs font-medium text-text transition-colors duration-200 ease-out hover:border-text/35"
          >
            <RotateCcw size={12} strokeWidth={2} aria-hidden="true" />
            Retry
          </button>
        )}
      </div>
    );
  }

  if (state.status === "quota-exhausted") {
    // Calm, not red: nothing the visitor did, and the site itself still answers.
    return (
      <div className="mt-3 rounded-md border border-border bg-bg-subtle px-3.5 py-3 text-sm leading-snug text-text-secondary">
        <p className="font-medium text-text">{QUOTA_COPY}</p>
        <p className="mt-1">
          Everything it knows is on this site — or email{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="font-medium text-accent-text underline decoration-accent/30 underline-offset-2 transition-colors hover:decoration-accent-text"
          >
            {siteConfig.email}
          </a>
          .
        </p>
      </div>
    );
  }

  return null;
}
