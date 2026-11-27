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
    topic: ":dart: Every website enquiry, estimate and booking · first reply within 2 working hours",
    purpose: "Private sales inbox. Each website enquiry, project estimate and consultation booking lands here with the visitor's details, budget and a link to it in the admin.",
    posts: ["Contact form messages", "Project estimates with budget and timeline", "Consultation bookings with slot and mode", "Email or CRM delivery problems for a lead"],
    rules: [
      "React with :eyes: as soon as you pick an enquiry up, so nobody doubles up.",
      "First reply within 2 working hours, by phone or WhatsApp, then email.",
      "Log every call and next step in the thread under the enquiry.",
      "Move the status in the admin: new → contacted → qualified → proposal → won or lost.",
      "Customer details stay in this channel and the admin. Never forward or screenshot them.",
    ],
  },
  hiring: {
    topic: ":briefcase: Job applications and openings from the careers page · decision within 3 working days",
    purpose: "Private hiring channel. New applications arrive with role, contact and portfolio links (CVs stay in the admin), plus every role opened or closed.",
    posts: ["New job applications", "Roles opened or closed on the careers page"],
    rules: [
      "React with :eyes: when you start reviewing an application.",
      "Shortlist or reject in the admin within 3 working days. Every applicant hears back.",
      "Interview notes and feedback go in the thread under the application.",
      "CVs and personal details stay in the admin. Do not download or forward them.",
      "Keep feedback factual and respectful. Candidates can ask what we wrote.",
    ],
  },
  team: {
    topic: ":calendar: Leave, attendance, team changes and the 9:00 IST daily summary",
    purpose: "Day-to-day team operations: leave and attendance requests and decisions, people joining or leaving, and the morning summary of what is waiting on the team.",
    posts: ["Leave requests and decisions", "Attendance corrections", "People added to or removed from the admin", "The 9:00 IST daily summary"],
    rules: [
      "Approve or decline requests in the admin. The decision is posted here automatically.",
      "Managers act on pending requests the same working day.",
      "Personal reasons for leave are never posted here, only kept in the admin.",
      "Start your day with the 9:00 summary and clear anything assigned to you.",
    ],
  },
  alerts: {
    topic: ":rotating_light: Automatic website alerts: errors, failed emails, CRM sync and deploys",
    purpose: "Problems the website reports by itself (server errors, failed emails, Zoho or CRM sync failures) plus every deploy, successful or failed.",
    posts: ["Server errors", "Failed customer or HR emails", "Zoho and CRM sync failures", "Deploy succeeded or failed"],
    rules: [
      "React with :eyes: when you look into an alert, and :white_check_mark: once it is fixed.",
      "Write the cause and the fix in the thread, so the next person knows.",
      "A failed lead email means a customer may not have heard from us. Check #leads first.",
      "The same alert repeats at most once every 15 minutes, so a quiet channel means things are fine.",
    ],
  },
  security: {
    topic: ":lock: Admin sign-ins, password, 2-step and access changes · admins only",
    purpose: "Private, admins only. Security events from the admin panel: new-device sign-ins, lockouts, password and 2-step changes, and role or access changes.",
    posts: ["Sign-ins and new-device sign-ins", "Lockouts after failed attempts", "Password resets and changes", "2-step verification changes", "Role, access and account changes"],
    rules: [
      "Don't recognise an event? Open the person in Admin → People, sign them out everywhere and reset their password.",
      "New-device sign-ins are normal after someone changes laptop or browser. Confirm with them if unsure.",
      "Every admin keeps 2-step verification on.",
      "Keep this channel private and admins only. Never invite guests.",
    ],
  },
  marketing: {
    topic: ":mega: Newsletter sign-ups and blog posts as they go live",
    purpose: "Growth and content: new newsletter subscribers and every blog post the moment it is published.",
    posts: ["New newsletter subscribers", "Blog posts going live"],
    rules: [
      "Share every new post on LinkedIn within a day of it going live.",
      "Add new posts to the next newsletter.",
      "Contact subscribers through campaigns only, never personal email.",
      "Ideas for posts and campaigns are welcome in threads.",
    ],
  },
  wins: {
    topic: ":trophy: Deals won · celebrate the team",
    purpose: "Every enquiry or CRM lead marked as won, with the service and who closed it. No customer details are posted here.",
    posts: ["Enquiries and CRM leads marked won"],
    rules: [
      "Celebrate every win :tada:",
      "The closer adds what worked in the thread, so the team can repeat it.",
      "Customer names and details stay in the admin and #leads.",
    ],
  },
  announcements: {
    topic: ":loudspeaker: Company news and new team members",
    purpose: "Company-wide updates. New team members are introduced here automatically when they are added in the admin.",
    posts: ["New team member introductions", "Company-wide news"],
    rules: [
      "Company-wide updates only. Reply in threads to keep the channel easy to read.",
      "Welcome every new joiner in their introduction thread :wave:",
      "Use @channel only for news that truly concerns everyone.",
    ],
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
    const message = {
      channel: channel.id,
      text: `Channel guide: #${channel.name}`,
      unfurl_links: "false",
      blocks: [
        { type: "header", text: { type: "plain_text", text: `:pushpin:  How we use #${channel.name}`, emoji: true } },
        { type: "section", text: { type: "mrkdwn", text: guide.purpose } },
        { type: "divider" },
        { type: "section", text: { type: "mrkdwn", text: `*What lands here*\n${guide.posts.map((item) => `• ${item}`).join("\n")}` } },
        { type: "section", text: { type: "mrkdwn", text: `*House rules*\n${guide.rules.map((rule, i) => `${i + 1}. ${rule}`).join("\n")}` } },
        { type: "divider" },
        { type: "context", elements: [{ type: "mrkdwn", text: "Posted by the Setuware website · <https://setuware.in/admin|Open the admin> · Questions? Ask in #announcements" }] },
      ],
    };
    const pins = await api("pins.list", { channel: channel.id });
    const guidePin = (pins.items ?? []).find((item) => item.message?.user === me.user_id && item.message?.text?.startsWith("Channel guide"));
    const stale = guidePin && JSON.stringify(guidePin.message.blocks?.map((b) => b.text?.text ?? "")) !== JSON.stringify(message.blocks.map((b) => b.text?.text ?? ""));
    const updated = stale ? (await api("chat.update", { ...message, ts: guidePin.message.ts })).ok : false;
    if (!guidePin || (stale && !updated)) {
      // No guide yet, or the old one can no longer be edited: pin a fresh one in its place.
      const posted = await api("chat.postMessage", message);
      if (posted.ok) {
        const pinnedNew = await api("pins.add", { channel: channel.id, timestamp: posted.ts });
        if (guidePin && pinnedNew.ok) await api("pins.remove", { channel: channel.id, timestamp: guidePin.message.ts });
      }
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
