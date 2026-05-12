import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  subject: z.string().min(4).max(200),
  message: z.string().min(20).max(5000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Nodemailer transport — configure via env vars.
    // For dev, use Ethereal (https://ethereal.email) or set real SMTP creds.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.ethereal.email",
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL ?? process.env.SMTP_USER,
      replyTo: data.email,
      subject: `[Portfolio] ${data.subject}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#7c3aed">New contact form submission</h2>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:8px;color:#888">From</td><td style="padding:8px;color:#fff">${data.name} &lt;${data.email}&gt;</td></tr>
            <tr><td style="padding:8px;color:#888">Subject</td><td style="padding:8px;color:#fff">${data.subject}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#111;border-radius:8px;color:#ccc;white-space:pre-wrap">${data.message}</div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 422 });
    }
    console.error("[contact]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
