#!/usr/bin/env node
/**
 * Slack helper for the server (reads .env.production.local like the site).
 *
 *   npm run slack:test                       one test message to every channel
 *   node scripts/slack.mjs post alerts "…"   one message to one channel
 *
 * Channels and settings: docs/slack.md.
 */
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd(), false);

const CHANNELS = {
  leads: ["SLACK_CHANNEL_LEADS", "#leads"],
  hiring: ["SLACK_CHANNEL_HIRING", "#hiring"],
  team: ["SLACK_CHANNEL_TEAM", "#team-ops"],
  alerts: ["SLACK_CHANNEL_ALERTS", "#site-alerts"],
  security: ["SLACK_CHANNEL_SECURITY", "#security"],
  marketing: ["SLACK_CHANNEL_MARKETING", "#marketing"],
  digest: ["SLACK_CHANNEL_DIGEST", ""],
};

const token = process.env.SLACK_BOT_TOKEN?.trim();
const [command = "test", channelKey, ...words] = process.argv.slice(2);

function target(key) {
  const [env, fallback] = CHANNELS[key];
  const value = process.env[env]?.trim() || fallback || (key === "digest" ? target("team") : "");
  return value.toLowerCase() === "off" ? "" : value;
}

async function post(key, text) {
  const channel = target(key);
  if (!channel) return console.log(`- ${key}: off`);
  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8", authorization: `Bearer ${token}` },
    body: JSON.stringify({ channel, text, unfurl_links: false }),
  });
  const body = await response.json().catch(() => ({}));
  console.log(body.ok ? `✓ ${key}: posted to ${channel}` : `✗ ${key}: ${channel} → ${body.error ?? response.status}`);
  return body.ok;
}

if (!token) {
  console.error("SLACK_BOT_TOKEN is not set (add it to .env.production.local). Nothing sent.");
  process.exit(command === "post" ? 0 : 1);
}

if (command === "post") {
  if (!CHANNELS[channelKey] || !words.length) {
    console.error(`Usage: node scripts/slack.mjs post <${Object.keys(CHANNELS).join("|")}> "message"`);
    process.exit(1);
  }
  await post(channelKey, words.join(" "));
} else {
  const results = [];
  for (const key of Object.keys(CHANNELS)) {
    if (key === "digest" && !process.env.SLACK_CHANNEL_DIGEST) continue;
    results.push(await post(key, `:white_check_mark: Setuware website is connected to this channel (*${key}* notifications).`));
  }
  if (results.some((ok) => ok === false)) {
    console.error("\nSome channels failed. not_in_channel / channel_not_found: create the channel, or invite the app to a private channel (/invite @Setuware Website).");
    process.exit(1);
  }
}
