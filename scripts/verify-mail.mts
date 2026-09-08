/**
 * Contact-form mail check.
 *
 *   npm run mail:verify        — validate config + authenticate, send nothing
 *   npm run mail:verify -- --send   — also deliver a real test message
 *
 * Exists because the contact form's only failure signal in the UI is a generic
 * "something went wrong", and its previous default (Ethereal) accepted mail and
 * delivered it nowhere. This tells you which of the two is happening.
 *
 * Run through Node's own env loader and type stripping — no extra tooling:
 *   node --env-file=.env scripts/verify-mail.ts
 */
import { resolveMailConfig, sendContactMail, verifyMailTransport } from "../lib/server/mail.ts";

const FAKE = /ethereal\.email$/i;

async function main() {
  const send = process.argv.includes("--send");

  let config;
  try {
    config = resolveMailConfig();
  } catch (err) {
    console.error(`\n✗ ${(err as Error).message}\n`);
    process.exit(1);
  }

  console.log("\nSMTP configuration");
  console.log(`  host      ${config.host}:${config.port}`);
  console.log(`  secure    ${config.secure ? "implicit TLS (465)" : "STARTTLS"}`);
  console.log(`  user      ${config.user}`);
  console.log(`  delivers  ${config.to}`);

  if (FAKE.test(config.host)) {
    console.error(
      "\n✗ This host is Ethereal — nodemailer's FAKE smtp service.\n" +
        "  It accepts mail into a throwaway web inbox and delivers to nobody.\n" +
        "  Nothing sent through it will ever reach " +
        config.to +
        ".\n" +
        "  Point SMTP_HOST at a real provider (see .env.local.example).\n",
    );
    process.exit(1);
  }

  try {
    await verifyMailTransport();
    console.log("\n✓ Connected and authenticated.");
  } catch (err) {
    const message = (err as Error).message;
    console.error(`\n✗ Could not authenticate: ${message}`);
    if (/535|invalid login|username and password/i.test(message)) {
      console.error(
        "  For Gmail this almost always means SMTP_PASS is an account password.\n" +
          "  It must be a 16-character App Password (needs 2-Step Verification on).",
      );
    }
    console.error("");
    process.exit(1);
  }

  if (!send) {
    console.log("  Re-run with `-- --send` to deliver a real test message.\n");
    return;
  }

  try {
    await sendContactMail({
      name: "Mail check",
      email: config.to,
      subject: "Contact form delivery test",
      message:
        "If this is in your inbox, the portfolio contact form can deliver mail. " +
        "Sent by scripts/verify-mail.ts.",
    });
    console.log(`✓ Test message accepted for delivery to ${config.to}.`);
    console.log("  Check the inbox (and spam) — it should arrive within a minute.\n");
  } catch (err) {
    console.error(`\n✗ Send failed: ${(err as Error).message}\n`);
    process.exit(1);
  }
}

main();
