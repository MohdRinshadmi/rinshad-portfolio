import nodemailer, { type Transporter } from "nodemailer";

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface MailConfig {
  host: string;
  port: number;
  /** Implicit TLS on 465; STARTTLS on 587/25. */
  secure: boolean;
  user: string;
  pass: string;
  /** Inbox the contact form delivers to. */
  to: string;
}

/**
 * Ethereal is nodemailer's FAKE smtp service: it accepts a message, files it in
 * a throwaway web inbox, and delivers it to nobody. It is a fine local sink and
 * a silent black hole in production — mail "sends", the form says "Message
 * sent", and nothing ever arrives. This config previously defaulted to it, so
 * every real submission was lost. Never let it be reachable by accident again.
 */
const FAKE_HOSTS = ["smtp.ethereal.email", "ethereal.email"];

/** Google shows an App Password as four groups of four for readability
    ("abcd efgh ijkl mnop"); the credential itself is the 16 characters. */
const APP_PASSWORD_DISPLAY = /^[a-z0-9]{4}(?: [a-z0-9]{4}){3}$/i;

/**
 * Normalise a pasted secret.
 *
 * Always trims the ends. Removes INTERNAL spaces only when the value is exactly
 * Google's four-by-four display form — pasting it straight out of the App
 * Passwords screen is the obvious thing to do, and the spaces are presentation,
 * not part of the secret. Any other password keeps its spaces, because for a
 * provider that permits them they are real characters.
 */
export function normalizeSecret(value: string): string {
  const trimmed = value.trim();
  return APP_PASSWORD_DISPLAY.test(trimmed) ? trimmed.replaceAll(" ", "") : trimmed;
}

/** Just the keys this reads — `process.env` satisfies it, and so does a
    partial fixture, which `NodeJS.ProcessEnv` (NODE_ENV required) would not. */
export type MailEnv = Record<string, string | undefined>;

class MailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MailConfigError";
  }
}

/**
 * Read and validate SMTP settings from the environment.
 *
 * Deliberately has NO fallback host. A missing variable throws with the name of
 * what is missing, because the alternative — quietly substituting a default —
 * is exactly the failure this function exists to prevent.
 */
export function resolveMailConfig(env: MailEnv = process.env): MailConfig {
  const missing = (["SMTP_HOST", "SMTP_USER", "SMTP_PASS"] as const).filter(
    (key) => !env[key]?.trim(),
  );

  if (missing.length > 0) {
    throw new MailConfigError(
      `Contact form is not configured: missing ${missing.join(", ")}. ` +
        `Set these in .env (local) and in your host's environment (production).`,
    );
  }

  const host = env.SMTP_HOST!.trim();
  const port = Number(env.SMTP_PORT ?? 587);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new MailConfigError(`SMTP_PORT must be a valid port number, got "${env.SMTP_PORT}".`);
  }

  if (FAKE_HOSTS.includes(host.toLowerCase()) && env.NODE_ENV === "production") {
    throw new MailConfigError(
      `SMTP_HOST is "${host}", which never delivers mail to real inboxes. ` +
        `Point it at a real SMTP provider before deploying.`,
    );
  }

  const user = env.SMTP_USER!.trim();

  return {
    host,
    port,
    // 465 is implicit TLS and MUST set secure; 587 upgrades via STARTTLS.
    // This was hard-coded false, so a 465 provider could never connect.
    secure: port === 465,
    user,
    pass: normalizeSecret(env.SMTP_PASS!),
    to: env.CONTACT_EMAIL?.trim() || user,
  };
}

/**
 * Module-level transport singleton — nodemailer keeps an SMTP connection pool,
 * so building a new transporter per request throws that reuse away and adds a
 * TCP+TLS handshake to every submission.
 */
let transporter: Transporter | undefined;
let cachedConfig: MailConfig | undefined;

function getTransport(): { transport: Transporter; config: MailConfig } {
  cachedConfig ??= resolveMailConfig();
  transporter ??= nodemailer.createTransport({
    host: cachedConfig.host,
    port: cachedConfig.port,
    secure: cachedConfig.secure,
    auth: { user: cachedConfig.user, pass: cachedConfig.pass },
    // Bound how long a misconfigured/unreachable SMTP server can block the request.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return { transport: transporter, config: cachedConfig };
}

/** Escape user input before interpolating it into the HTML email body. */
function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Strip CR/LF so a crafted subject can't inject extra SMTP headers. */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function renderContactEmail(data: ContactMessage): { text: string; html: string } {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const subject = escapeHtml(data.subject);
  const message = escapeHtml(data.message);

  return {
    text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
    /* Every colour is stated against an explicit background. An earlier version
       set `color:#fff` on cells with no background of their own, so the sender
       and subject rendered white-on-white in any light-mode client. */
    html: `
      <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f7f5f2;color:#0a0a0a">
        <h2 style="margin:0 0 20px;font-size:18px;font-weight:600;color:#a8482a">New contact form submission</h2>
        <table style="border-collapse:collapse;width:100%;background:#ffffff;border:1px solid #e5e2dc;border-radius:8px">
          <tr>
            <td style="padding:10px 12px;color:#6a6a64;font-size:13px;width:88px">From</td>
            <td style="padding:10px 12px;color:#0a0a0a;font-size:14px">${name} &lt;${email}&gt;</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;color:#6a6a64;font-size:13px;border-top:1px solid #e5e2dc">Subject</td>
            <td style="padding:10px 12px;color:#0a0a0a;font-size:14px;border-top:1px solid #e5e2dc">${subject}</td>
          </tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#ffffff;border:1px solid #e5e2dc;border-radius:8px;color:#0a0a0a;font-size:14px;line-height:1.6;white-space:pre-wrap">${message}</div>
      </div>
    `,
  };
}

export async function sendContactMail(data: ContactMessage): Promise<void> {
  const { transport, config } = getTransport();
  const { text, html } = renderContactEmail(data);

  await transport.sendMail({
    // The envelope sender must be the authenticated mailbox — Gmail and most
    // providers reject or rewrite anything else. The visitor goes in replyTo,
    // so hitting Reply in the client answers them directly.
    from: `"Portfolio Contact" <${config.user}>`,
    to: config.to,
    replyTo: `"${singleLine(data.name)}" <${data.email}>`,
    subject: `[Portfolio] ${singleLine(data.subject)}`,
    text,
    html,
  });
}

/** Open a connection and authenticate, without sending anything. */
export async function verifyMailTransport(): Promise<MailConfig> {
  const { transport, config } = getTransport();
  await transport.verify();
  return config;
}
