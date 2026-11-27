#!/usr/bin/env node
/**
 * Slack helper for the server (reads .env.production.local like the site).
 *
 *   npm run slack:setup                      join channels, set topics, pin a guide in each (safe to rerun)
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
  wins: ["SLACK_CHANNEL_WINS", "#wins"],
  announcements: ["SLACK_CHANNEL_ANNOUNCEMENTS", "#announcements"],
  digest: ["SLACK_CHANNEL_DIGEST", ""],
};

/** Topic, purpose and the pinned guide for each channel. */
const GUIDES = {
  leads: {
    topic: "New enquiries, estimates and bookings from setuware.in",
    purpose: "Every website enquiry, estimate request and consultation booking, with a link to it in the admin.",
    rules: [
      "React with :eyes: and reply in the thread when you pick an enquiry up.",
      "Contact every new enquiry within 2 working hours.",
      "Move the status along in the admin: contacted → qualified → proposal → won or lost.",
      "Customer details stay in this channel and the admin. Do not forward them.",
    ],
  },
  hiring: {
    topic: "Job applications and openings from setuware.in/careers",
    purpose: "New applications (CVs are in the admin) and roles being opened or closed.",
    rules: [
      "React with :eyes: when you start reviewing an application.",
      "Shortlist or reject in the admin within 3 working days.",
      "Keep interview feedback in the thread. CVs stay in the admin.",
    ],
  },
  team: {
    topic: "Leave, attendance, team changes and the 9:00 daily summary",
    purpose: "Leave and attendance requests and decisions, people joining or leaving, and the morning summary.",
    rules: [
      "Approve or decline requests in the admin; the decision is posted here.",
      "The 9:00 IST summary lists everything that is waiting on the team.",
      "Personal reasons for leave are never posted here, only in the admin.",
    ],
  },
  alerts: {
    topic: "Automatic alerts: errors, failed emails, CRM sync, deploys",
    purpose: "Problems the website reports by itself, plus every deploy.",
    rules: [
      "React with :eyes: when you look into an alert and :white_check_mark: when it is fixed.",
      "Write the cause and the fix in the thread.",
      "The same alert is sent at most once every 15 minutes.",
    ],
  },
  security: {
    topic: "Admin sign-ins, password, 2-step and access changes",
    purpose: "Security events from the admin. Keep this channel private to admins.",
    rules: [
      "If you do not recognise an event, open the person in Admin → People, sign them out everywhere and reset their password.",
      "New-device sign-ins are normal after someone changes laptop or browser.",
      "Keep this channel private and admins-only.",
    ],
  },
  marketing: {
    topic: "Newsletter sign-ups and new blog posts",
    purpose: "Newsletter subscribers and blog posts as they go live.",
    rules: [
      "Share every new post on LinkedIn and in the next newsletter.",
      "Reach subscribers through campaigns, not personal email.",
    ],
  },
  wins: {
    topic: "Deals won :trophy:",
    purpose: "Every enquiry or CRM lead marked as won.",
    rules: ["Celebrate! :tada:", "Add what worked in the thread so the team can repeat it."],
  },
  announcements: {
    topic: "Company-wide news and new team members",
    purpose: "Company updates. New team members are introduced here automatically.",
    rules: ["Company-wide updates only. Reply in threads to keep the channel easy to read.", "Welcome new joiners in their introduction thread :wave:"],
  },
};

const token = process.env.SLACK_BOT_TOKEN?.trim();
const [command = "test", channelKey, ...words] = process.argv.slice(2);

function target(key) {
  const [env, fallback] = CHANNELS[key];
  const value = process.env[env]?.trim() || fallback || (key === "digest" ? target("team") : "");
  return value.toLowerCase() === "off" ? "" : value;
}

async function api(method, params = {}) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined) body.set(key, typeof value === "string" ? value : JSON.stringify(value));
  const response = await fetch(`https://slack.com/api/${method}`, { method: "POST", headers: { authorization: `Bearer ${token}` }, body });
  return response.json().catch(() => ({ ok: false, error: `http_${response.status}` }));
}

async function setup() {
  const me = await api("auth.test");
  if (!me.ok) {
    console.error(`Token rejected: ${me.error}`);
    process.exit(1);
  }
  const channels = [];
  let cursor;
  do {
    const page = await api("conversations.list", { types: "public_channel,private_channel", exclude_archived: "true", limit: "1000", cursor });
    if (!page.ok) {
      console.error(`Could not list channels: ${page.error} (reinstall the app with the scopes in docs/slack.md)`);
      process.exit(1);
    }
    channels.push(...page.channels);
    cursor = page.response_metadata?.next_cursor || undefined;
  } while (cursor);

  let problems = 0;
  for (const [key, guide] of Object.entries(GUIDES)) {
    const wanted = target(key);
    if (!wanted) continue;
    const channel = channels.find((item) => item.id === wanted || `#${item.name}` === wanted || item.name === wanted);
    if (!channel) {
      console.log(`✗ ${key}: ${wanted} does not exist yet. Create it in Slack, then rerun.`);
      problems += 1;
      continue;
    }
    if (!channel.is_member) {
      if (channel.is_private) {
        console.log(`✗ ${key}: #${channel.name} is private. Type /invite @Setuware Website in it, then rerun.`);
        problems += 1;
        continue;
      }
      await api("conversations.join", { channel: channel.id });
    }
    if (channel.topic?.value !== guide.topic) await api("conversations.setTopic", { channel: channel.id, topic: guide.topic });
    if (channel.purpose?.value !== guide.purpose) await api("conversations.setPurpose", { channel: channel.id, purpose: guide.purpose });
    const pins = await api("pins.list", { channel: channel.id });
    const pinned = (pins.items ?? []).some((item) => item.message?.user === me.user_id && item.message?.text?.startsWith("Channel guide"));
    if (!pinned) {
      const posted = await api("chat.postMessage", {
        channel: channel.id,
        text: `Channel guide: #${channel.name}`,
        unfurl_links: "false",
        blocks: [
          { type: "header", text: { type: "plain_text", text: `:pushpin:  How we use #${channel.name}`, emoji: true } },
          { type: "section", text: { type: "mrkdwn", text: guide.purpose } },
          { type: "section", text: { type: "mrkdwn", text: `*House rules*\n${guide.rules.map((rule) => `• ${rule}`).join("\n")}` } },
          { type: "context", elements: [{ type: "mrkdwn", text: "Posted by the Setuware website · <https://setuware.in/admin|Open the admin>" }] },
        ],
      });
      if (posted.ok) await api("pins.add", { channel: channel.id, timestamp: posted.ts });
    }
    console.log(`✓ ${key}: #${channel.name} ready`);
  }
  if (problems) process.exit(1);
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

if (command === "setup") {
  await setup();
} else if (command === "post") {
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
