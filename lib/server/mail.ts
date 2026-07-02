import nodemailer, { type Transporter } from "nodemailer";

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Module-level transport singleton — nodemailer keeps an SMTP connection pool,
 * so building a new transporter per request throws that reuse away and adds a
 * TCP+TLS handshake to every submission.
 */
let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.ethereal.email",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Bound how long a misconfigured/unreachable SMTP server can block the request.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transporter;
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

export async function sendContactMail(data: ContactMessage): Promise<void> {
  const name = escapeHtml(data.name);
  const email = escapeHtml(data.email);
  const subject = escapeHtml(data.subject);
  const message = escapeHtml(data.message);

  await getTransporter().sendMail({
    from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL ?? process.env.SMTP_USER,
    replyTo: data.email,
    subject: `[Portfolio] ${data.subject}`,
    text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#7c3aed">New contact form submission</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;color:#888">From</td><td style="padding:8px;color:#fff">${name} &lt;${email}&gt;</td></tr>
          <tr><td style="padding:8px;color:#888">Subject</td><td style="padding:8px;color:#fff">${subject}</td></tr>
        </table>
        <div style="margin-top:16px;padding:16px;background:#111;border-radius:8px;color:#ccc;white-space:pre-wrap">${message}</div>
      </div>
    `,
  });
}
