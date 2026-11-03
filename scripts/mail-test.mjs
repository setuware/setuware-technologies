#!/usr/bin/env node
/**
 * Checks the enquiry e-mail settings and sends one test e-mail.
 *
 *   npm run mail:test
 *
 * Reads the same files as the site (.env.production.local, .env.local, .env…)
 * from the project folder, so run it on the server from that folder.
 */
import nextEnv from "@next/env";
import nodemailer from "nodemailer";

nextEnv.loadEnvConfig(process.cwd(), false);

const { SMTP_HOST, SMTP_PORT = "465", SMTP_USER, SMTP_PASS } = process.env;
const to = process.env.LEAD_EMAIL_TO ?? "sales@setuware.in";
const from = process.env.LEAD_EMAIL_FROM ?? `Setuware Technologies <${SMTP_USER}>`;

const missing = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"].filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`✗ Missing settings: ${missing.join(", ")}`);
  console.error("  Add them to .env.production.local in the project folder, then run this again.");
  process.exit(1);
}

console.log(`SMTP ${SMTP_HOST}:${SMTP_PORT} as ${SMTP_USER}`);
console.log(`From: ${from}`);
console.log(`To:   ${to}\n`);

if (!from.includes(SMTP_USER)) {
  console.warn("! LEAD_EMAIL_FROM is not the SMTP mailbox. Zoho rejects mail sent as a different address.\n");
}

const port = Number(SMTP_PORT);
const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: port === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
});

function hint(error) {
  const code = error?.code ?? "";
  const text = `${error?.message ?? ""} ${error?.response ?? ""}`.toLowerCase();
  if (code === "EAUTH" || text.includes("535") || text.includes("authentication")) {
    return [
      "Login was rejected. Check that:",
      "  • SMTP_USER is the full address, e.g. sales@setuware.in",
      "  • SMTP_PASS is an app password from accounts.zoho.in → Security → App Passwords (no spaces)",
      "  • IMAP access is enabled in Zoho Mail → Settings → Mail Accounts",
      "  • the mailbox is on a paid Zoho plan (the Forever Free plan has no SMTP access)",
    ].join("\n");
  }
  if (["ETIMEDOUT", "ECONNECTION", "ESOCKET", "ECONNREFUSED", "EDNS"].includes(code) || text.includes("timeout") || text.includes("enotfound")) {
    return [
      "Could not reach the mail server. Check that:",
      "  • SMTP_HOST is smtp.zoho.in (India data centre) — not smtp.zoho.com",
      "  • outbound port 465 is open; or set SMTP_PORT=587 and try again",
    ].join("\n");
  }
  if (text.includes("553") || text.includes("relaying") || text.includes("sender address")) {
    return "The From address is not allowed. Set LEAD_EMAIL_FROM to the SMTP mailbox, e.g. \"Setuware Technologies <sales@setuware.in>\".";
  }
  return "See the error above.";
}

try {
  await transport.verify();
  console.log("✓ Connected and logged in");
  const info = await transport.sendMail({
    from,
    to,
    subject: "Setuware website — test e-mail",
    text: `This is a test from npm run mail:test on ${new Date().toISOString()}.\nIf you can read this, enquiry e-mails are configured correctly.`,
  });
  console.log(`✓ Test e-mail sent (${info.messageId}). Check the ${to} inbox and spam folder.`);
  console.log("\nIf the site still sends nothing, restart it so it picks up the settings:");
  console.log("  pm2 restart setuware --update-env");
} catch (error) {
  console.error(`✗ ${error?.code ?? "Error"}: ${error?.message ?? error}`);
  if (error?.response) console.error(`  Server said: ${error.response}`);
  console.error(`\n${hint(error)}`);
  process.exit(1);
}
