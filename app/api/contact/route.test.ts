import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/* The route reaches SMTP; stub the transport so tests assert routing and
   policy, not mail delivery. Hoisted because vi.mock is hoisted above imports. */
const sendContactMail = vi.hoisted(() => vi.fn());
vi.mock("@/lib/server/mail", () => ({ sendContactMail }));

const { POST } = await import("./route");

const VALID = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Backend role at Acme",
  message: "We are hiring a backend engineer and your API work looks relevant.",
};

/** Each test gets its own IP so the module-level limiter stays isolated. */
let ipCounter = 0;
const freshIp = () => `203.0.113.${++ipCounter % 250}`;

function post(body: unknown, ip: string) {
  return POST(
    new NextRequest("https://rinshad.dev/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  sendContactMail.mockReset();
  sendContactMail.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /api/contact", () => {
  it("accepts a valid message and sends exactly one mail", async () => {
    const res = await post(VALID, freshIp());

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
    expect(sendContactMail).toHaveBeenCalledTimes(1);
    expect(sendContactMail).toHaveBeenCalledWith(expect.objectContaining(VALID));
  });

  describe("validation", () => {
    const cases: [string, unknown][] = [
      ["a name under 2 characters", { ...VALID, name: "A" }],
      ["a malformed email", { ...VALID, email: "not-an-email" }],
      ["a subject under 4 characters", { ...VALID, subject: "hi" }],
      ["a message under 20 characters", { ...VALID, message: "too short" }],
      ["a missing field", { name: "Ada", email: "ada@example.com" }],
      ["an over-long message", { ...VALID, message: "a".repeat(5001) }],
      ["an over-long name", { ...VALID, name: "a".repeat(101) }],
    ];

    for (const [label, body] of cases) {
      it(`rejects ${label} with 422 and sends nothing`, async () => {
        const res = await post(body, freshIp());
        expect(res.status).toBe(422);
        expect(sendContactMail).not.toHaveBeenCalled();
      });
    }
  });

  describe("honeypot", () => {
    it("silently drops a submission with the honeypot filled", async () => {
      const res = await post({ ...VALID, hp_field: "AcmeBot" }, freshIp());

      // 200 so the bot books a success and does not retry…
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ ok: true });
      // …but nothing is actually sent.
      expect(sendContactMail).not.toHaveBeenCalled();
    });

    it("still accepts a submission that omits the field entirely", async () => {
      const res = await post(VALID, freshIp());
      expect(res.status).toBe(200);
      expect(sendContactMail).toHaveBeenCalledTimes(1);
    });

    it("ignores a field named `company` — that name gets autofilled", async () => {
      // Regression: the trap used to be called "company", so Chrome filled it
      // from the saved address profile and real messages were binned.
      const res = await post({ ...VALID, company: "Acme Inc" }, freshIp());
      expect(res.status).toBe(200);
      expect(sendContactMail).toHaveBeenCalledTimes(1);
    });

    it("treats an empty honeypot as a human", async () => {
      const res = await post({ ...VALID, hp_field: "" }, freshIp());
      expect(res.status).toBe(200);
      expect(sendContactMail).toHaveBeenCalledTimes(1);
    });

    it("costs nothing against the rate limit", async () => {
      const ip = freshIp();
      for (let i = 0; i < 8; i++) {
        await post({ ...VALID, hp_field: "bot" }, ip);
      }
      // The honeypot returns before the limiter, so a real message still lands.
      const res = await post(VALID, ip);
      expect(res.status).toBe(200);
      expect(sendContactMail).toHaveBeenCalledTimes(1);
    });
  });

  describe("rate limiting", () => {
    it("allows 10 messages an hour, then answers 429 with Retry-After", async () => {
      const ip = freshIp();

      for (let i = 1; i <= 10; i++) {
        expect((await post(VALID, ip)).status, `message ${i}`).toBe(200);
      }

      const blocked = await post(VALID, ip);
      expect(blocked.status).toBe(429);
      expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0);
      expect(sendContactMail).toHaveBeenCalledTimes(10);
    });

    it("does not penalise a different sender", async () => {
      const noisy = freshIp();
      for (let i = 0; i < 11; i++) await post(VALID, noisy);
      sendContactMail.mockClear();

      expect((await post(VALID, freshIp())).status).toBe(200);
      expect(sendContactMail).toHaveBeenCalledTimes(1);
    });

    it("returns a human-readable error rather than leaking internals", async () => {
      const ip = freshIp();
      for (let i = 0; i < 11; i++) await post(VALID, ip);

      const body = (await (await post(VALID, ip)).json()) as { error: string };
      expect(body.error).toMatch(/too many/i);
      expect(body.error).not.toMatch(/stack|Error:/i);
    });
  });

  describe("failure handling", () => {
    it("answers 500 without leaking the transport error when SMTP fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      sendContactMail.mockRejectedValueOnce(new Error("SMTP 535 auth failed: hunter2"));

      const res = await post(VALID, freshIp());
      const body = (await res.json()) as { error: string };

      expect(res.status).toBe(500);
      expect(body.error).toBe("Internal server error");
      expect(JSON.stringify(body)).not.toContain("hunter2");
    });

    it("answers 500 on a malformed JSON body", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const res = await POST(
        new NextRequest("https://rinshad.dev/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json", "x-forwarded-for": freshIp() },
          body: "{ not json",
        }),
      );
      expect(res.status).toBe(500);
      expect(sendContactMail).not.toHaveBeenCalled();
    });
  });
});
