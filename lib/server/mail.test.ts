import { describe, expect, it } from "vitest";
import { normalizeSecret, renderContactEmail, resolveMailConfig, type MailEnv } from "./mail";

/* ============================================================================
   The contact form shipped for months pointed at smtp.ethereal.email — a fake
   service that accepts mail and delivers it nowhere — because the config had a
   silent fallback host. These tests pin the rules that stop that recurring.
   ========================================================================== */

const VALID = {
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: "465",
  SMTP_USER: "me@gmail.com",
  SMTP_PASS: "app-password",
  CONTACT_EMAIL: "inbox@gmail.com",
} satisfies MailEnv;

describe("resolveMailConfig", () => {
  it("reads a complete configuration", () => {
    expect(resolveMailConfig(VALID)).toEqual({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      user: "me@gmail.com",
      pass: "app-password",
      to: "inbox@gmail.com",
    });
  });

  it("has no fallback host — a missing one is an error, not a default", () => {
    // The whole bug: a default host meant "configured wrong" looked like "sent".
    expect(() => resolveMailConfig({ ...VALID, SMTP_HOST: undefined })).toThrow(/SMTP_HOST/);
  });

  it("names every missing variable at once", () => {
    expect(() => resolveMailConfig({})).toThrow(/SMTP_HOST, SMTP_USER, SMTP_PASS/);
  });

  it("treats a blank or whitespace-only variable as missing", () => {
    expect(() => resolveMailConfig({ ...VALID, SMTP_USER: "" })).toThrow(/SMTP_USER/);
    expect(() => resolveMailConfig({ ...VALID, SMTP_HOST: "   " })).toThrow(/SMTP_HOST/);
  });

  describe("TLS mode", () => {
    it("uses implicit TLS on 465", () => {
      expect(resolveMailConfig({ ...VALID, SMTP_PORT: "465" }).secure).toBe(true);
    });

    it("uses STARTTLS on 587", () => {
      // Previously hard-coded false, so a 465 provider could never connect.
      expect(resolveMailConfig({ ...VALID, SMTP_PORT: "587" }).secure).toBe(false);
    });

    it("defaults to 587 when the port is unset", () => {
      const config = resolveMailConfig({ ...VALID, SMTP_PORT: undefined });
      expect(config.port).toBe(587);
      expect(config.secure).toBe(false);
    });

    it("rejects a nonsense port", () => {
      expect(() => resolveMailConfig({ ...VALID, SMTP_PORT: "not-a-port" })).toThrow(/SMTP_PORT/);
      expect(() => resolveMailConfig({ ...VALID, SMTP_PORT: "0" })).toThrow(/SMTP_PORT/);
      expect(() => resolveMailConfig({ ...VALID, SMTP_PORT: "99999" })).toThrow(/SMTP_PORT/);
    });
  });

  describe("the Ethereal trap", () => {
    const ethereal = { ...VALID, SMTP_HOST: "smtp.ethereal.email" };

    it("refuses the fake service in production", () => {
      expect(() => resolveMailConfig({ ...ethereal, NODE_ENV: "production" })).toThrow(
        /never delivers/i,
      );
    });

    it("is case-insensitive about it", () => {
      expect(() => resolveMailConfig({ ...ethereal, SMTP_HOST: "SMTP.Ethereal.Email", NODE_ENV: "production" }))
        .toThrow(/never delivers/i);
    });

    it("still allows it locally, where a throwaway sink is the point", () => {
      expect(() => resolveMailConfig({ ...ethereal, NODE_ENV: "development" })).not.toThrow();
    });
  });

  describe("pasted App Passwords", () => {
    // Node's --env-file keeps internal spaces whether or not the value is
    // quoted, so "abcd efgh ijkl mnop" reaches us as 19 characters. Gmail wants
    // the 16. Accept the form the Google UI actually shows.
    it("accepts the four-by-four form straight from Google", () => {
      expect(resolveMailConfig({ ...VALID, SMTP_PASS: "abcd efgh ijkl mnop" }).pass).toBe(
        "abcdefghijklmnop",
      );
    });

    it("accepts it already stripped", () => {
      expect(resolveMailConfig({ ...VALID, SMTP_PASS: "abcdefghijklmnop" }).pass).toBe(
        "abcdefghijklmnop",
      );
    });

    it("is unaffected by surrounding quotes, which the env parser removes", () => {
      expect(resolveMailConfig({ ...VALID, SMTP_PASS: "abcd efgh ijkl mnop" }).pass).toBe(
        resolveMailConfig({ ...VALID, SMTP_PASS: "abcdefghijklmnop" }).pass,
      );
    });
  });

  describe("delivery address", () => {
    it("delivers to CONTACT_EMAIL when set", () => {
      expect(resolveMailConfig(VALID).to).toBe("inbox@gmail.com");
    });

    it("falls back to the authenticated mailbox", () => {
      expect(resolveMailConfig({ ...VALID, CONTACT_EMAIL: undefined }).to).toBe("me@gmail.com");
      expect(resolveMailConfig({ ...VALID, CONTACT_EMAIL: "  " }).to).toBe("me@gmail.com");
    });
  });
});

describe("renderContactEmail", () => {
  const data = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    subject: "Backend role",
    message: "Line one.\nLine two.",
  };

  it("puts the sender, subject and message in both parts", () => {
    const { text, html } = renderContactEmail(data);
    for (const body of [text, html]) {
      expect(body).toContain("Ada Lovelace");
      expect(body).toContain("ada@example.com");
    }
    expect(html).toContain("Backend role");
    expect(text).toContain("Line one.");
  });

  it("escapes HTML so a submission cannot inject markup", () => {
    const { html } = renderContactEmail({
      ...data,
      name: "<script>alert(1)</script>",
      message: "<img src=x onerror=alert(1)>",
    });
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;script&gt;");
  });

  it("states a background wherever it states a colour", () => {
    // Regression: `color:#fff` on cells with no background rendered the sender
    // and subject white-on-white in light-mode clients.
    const { html } = renderContactEmail(data);
    expect(html).not.toMatch(/color:#fff/i);
    for (const cell of html.match(/<td[^>]*>/g) ?? []) {
      if (/color:#0a0a0a/.test(cell)) {
        expect(html).toMatch(/background:#ffffff/);
      }
    }
  });
});

describe("normalizeSecret", () => {
  it("strips the spaces from Google's display form", () => {
    expect(normalizeSecret("abcd efgh ijkl mnop")).toBe("abcdefghijklmnop");
  });

  it("trims the ends of any secret", () => {
    expect(normalizeSecret("  re_abc123  ")).toBe("re_abc123");
  });

  it("keeps internal spaces in a passphrase that is not the 4x4 form", () => {
    // A provider may allow spaces; only the unmistakable Google shape is
    // treated as presentation.
    expect(normalizeSecret("correct horse battery staple")).toBe(
      "correct horse battery staple",
    );
    expect(normalizeSecret("abc efgh ijkl mnop")).toBe("abc efgh ijkl mnop");
    expect(normalizeSecret("abcd  efgh  ijkl  mnop")).toBe("abcd  efgh  ijkl  mnop");
  });

  it("leaves an ordinary API key alone", () => {
    expect(normalizeSecret("re_2Kd8fJ1x_ABCdefGHI")).toBe("re_2Kd8fJ1x_ABCdefGHI");
  });
});
