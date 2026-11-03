#!/usr/bin/env node
/**
 * Zoho CRM helper, run from the project folder on the server.
 *
 *   npm run crm:token -- <grant-code>   exchange a Self Client grant code for a refresh token
 *   npm run crm:test                    check the connection (signs in, reads your CRM user)
 *   npm run crm:test -- --create        also create one test Lead
 *
 * Reads ZOHO_* from .env.production.local / .env.local / the environment.
 */
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), false);

const accounts = (process.env.ZOHO_ACCOUNTS_URL ?? "https://accounts.zoho.in").replace(/\/$/, "");
const apiDomain = (process.env.ZOHO_API_DOMAIN ?? "https://www.zohoapis.in").replace(/\/$/, "");
const version = process.env.ZOHO_API_VERSION ?? "v7";
const { ZOHO_CLIENT_ID: clientId, ZOHO_CLIENT_SECRET: clientSecret, ZOHO_REFRESH_TOKEN: refreshToken } = process.env;

const [command, ...args] = process.argv.slice(2);

function fail(message, hint) {
  console.error(`\n✖ ${message}`);
  if (hint) console.error(`  ${hint}`);
  process.exit(1);
}

if (!clientId || !clientSecret) {
  fail(
    "ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET are not set.",
    "Add them to .env.production.local (see docs/zoho-crm.md), then run this again.",
  );
}

async function token(params) {
  const query = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, ...params });
  const response = await fetch(`${accounts}/oauth/v2/token?${query}`, { method: "POST" });
  return response.json();
}

if (command === "token") {
  const code = args[0];
  if (!code) fail("Pass the grant code:  npm run crm:token -- 1000.xxxx.yyyy");
  const data = await token({ grant_type: "authorization_code", code });
  if (!data.refresh_token) {
    fail(
      `Zoho said: ${data.error ?? JSON.stringify(data)}`,
      data.error === "invalid_code"
        ? "Grant codes expire after a few minutes and work once. Generate a new one and run this straight away."
        : `Check the client ID/secret and that ZOHO_ACCOUNTS_URL (${accounts}) matches your data centre.`,
    );
  }
  console.log("\n✔ Refresh token created. Add this line to .env.production.local:\n");
  console.log(`ZOHO_REFRESH_TOKEN=${data.refresh_token}`);
  if (data.api_domain && data.api_domain !== apiDomain) {
    console.log(`ZOHO_API_DOMAIN=${data.api_domain}`);
  }
  console.log("\nThen: pm2 restart setuware --update-env && npm run crm:test\n");
  process.exit(0);
}

if (command === "test") {
  if (!refreshToken) fail("ZOHO_REFRESH_TOKEN is not set.", "Run  npm run crm:token -- <grant-code>  first.");
  const auth = await token({ grant_type: "refresh_token", refresh_token: refreshToken });
  if (!auth.access_token) {
    fail(`Sign-in failed: ${auth.error ?? JSON.stringify(auth)}`, "The refresh token may be revoked or from another data centre.");
  }
  console.log("✔ Signed in to Zoho");

  const headers = { Authorization: `Zoho-oauthtoken ${auth.access_token}`, "content-type": "application/json" };
  const me = await fetch(`${apiDomain}/crm/${version}/users?type=CurrentUser`, { headers }).then((r) => r.json());
  const user = me.users?.[0];
  if (user) console.log(`✔ CRM user: ${user.full_name} <${user.email}>`);
  else console.log(`! Could not read the CRM user (${me.code ?? "no users scope"}); lead creation may still work.`);

  if (args.includes("--create")) {
    const response = await fetch(`${apiDomain}/crm/${version}/Leads`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: [
          {
            First_Name: "Test",
            Last_Name: "Lead (delete me)",
            Company: "Setuware website test",
            Email: `crm-test-${Date.now()}@example.com`,
            Lead_Source: process.env.ZOHO_LEAD_SOURCE ?? "Website",
            Description: "Created by npm run crm:test -- --create",
          },
        ],
      }),
    }).then((r) => r.json());
    const result = response.data?.[0] ?? response;
    if (result.code === "SUCCESS") console.log(`✔ Test Lead created (id ${result.details.id}). Delete it in Zoho CRM → Leads.`);
    else fail(`Lead creation failed: ${result.code} ${result.message ?? ""}`, result.details ? JSON.stringify(result.details) : undefined);
  } else {
    console.log("  Add  -- --create  to create one test Lead.");
  }
  process.exit(0);
}

fail("Unknown command.", "Use  npm run crm:token -- <code>  or  npm run crm:test");
