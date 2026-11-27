import { can, listUsers, type AdminUser } from "./cms/auth";
import { getDb } from "./cms/db";
import { adminUrl, card, slackApi, slackChannelTarget, slackConfigured, type SlackChannel } from "./slack";

/**
 * Slack onboarding. Every cron run looks up team members who are not yet
 * linked to Slack by their admin email. Once someone has joined the
 * workspace, the bot adds them to the channels their role needs and, for
 * people added in the last 60 days, sends a welcome DM. Each person is
 * handled once (marker in `settings`).
 */

const MARK = "slack-member:";
const PER_RUN = 10;
const WELCOME_WITHIN_MS = 60 * 86_400_000;

/** The channels a person's permissions call for. Everyone gets team and announcements. */
export function channelsFor(user: Pick<AdminUser, "permissions">): SlackChannel[] {
  const any = (...permissions: string[]) => permissions.some((permission) => can(user, permission));
  const channels: SlackChannel[] = ["team", "announcements"];
  if (any("enquiries.view", "leads.view", "bookings.view")) channels.push("leads", "wins");
  if (any("applications.view", "jobs.view")) channels.push("hiring");
  if (any("posts.view", "subscribers.view")) channels.push("marketing");
  if (any("settings.manage", "users.manage", "roles.manage")) channels.push("alerts", "security");
  return channels;
}

let channelIds: Map<string, string> | null = null;

async function channelId(target: string): Promise<string | null> {
  if (/^[CG][A-Z0-9]{6,}$/.test(target)) return target;
  if (!channelIds) {
    const found = new Map<string, string>();
    let cursor = "";
    do {
      const page = await slackApi<{ channels?: { id: string; name: string }[]; response_metadata?: { next_cursor?: string } }>("conversations.list", {
        types: "public_channel,private_channel",
        exclude_archived: "true",
        limit: "1000",
        cursor: cursor || undefined,
      });
      if (!page?.ok) return null;
      for (const channel of page.channels ?? []) found.set(channel.name, channel.id);
      cursor = page.response_metadata?.next_cursor ?? "";
    } while (cursor);
    channelIds = found;
  }
  return channelIds.get(target.replace(/^#/, "")) ?? null;
}

async function welcome(slackUser: string, user: AdminUser, channels: string[]): Promise<void> {
  const dm = await slackApi<{ channel?: { id: string } }>("conversations.open", { users: slackUser });
  if (!dm?.ok || !dm.channel) return;
  const first = user.name.split(/\s+/)[0] || user.name;
  const message = card(`Welcome to Setuware, ${first}!`, {
    icon: ":wave:",
    title: `Welcome to Setuware, ${first}!`,
    summary: [
      `Hi ${first}, great to have you here. You have been added to ${channels.length ? channels.join(", ") : "the team channels"}.`,
      "",
      "*Getting started*",
      "• Sign in to the admin, choose your password and turn on 2-step verification.",
      "• Check in from the dashboard when you start work.",
      "• Each channel has a pinned guide; read it before posting.",
      "• Say hello in the announcements thread introducing you.",
    ].join("\n"),
    buttons: [{ text: "Open the admin", url: adminUrl("/admin"), primary: true }],
    context: ["Questions? Ask your manager or post in the team channel"],
  });
  await slackApi("chat.postMessage", { channel: dm.channel.id, text: message.text, blocks: message.blocks, unfurl_links: "false" });
}

/** Links new Slack members to their channels. Returns how many people were handled. */
export async function syncSlackMembers(now: Date = new Date()): Promise<number> {
  if (!slackConfigured()) return 0;
  const db = getDb();
  const done = new Set((db.prepare("SELECT key FROM settings WHERE key LIKE ?").all(`${MARK}%`) as { key: string }[]).map((row) => row.key));
  const pending = listUsers()
    .filter((user) => user.active && user.email && !done.has(`${MARK}${user.id}`))
    .slice(0, PER_RUN);
  if (!pending.length) return 0;
  channelIds = null;
  let handled = 0;
  for (const user of pending) {
    const found = await slackApi<{ user?: { id: string } }>("users.lookupByEmail", { email: user.email });
    if (!found?.ok || !found.user) continue;
    const ids = new Set<string>();
    let complete = true;
    for (const channel of channelsFor(user)) {
      const target = slackChannelTarget(channel);
      const id = target ? await channelId(target) : null;
      if (!id || ids.has(id)) continue;
      const invited = await slackApi("conversations.invite", { channel: id, users: found.user.id });
      if (invited?.ok || invited?.error === "already_in_channel") ids.add(id);
      else complete = false;
    }
    if (!complete) continue;
    db.prepare("INSERT OR IGNORE INTO settings (key,value) VALUES (?, ?)").run(`${MARK}${user.id}`, JSON.stringify({ slack: found.user.id, at: now.toISOString() }));
    handled += 1;
    if (now.getTime() - Date.parse(user.created_at) < WELCOME_WITHIN_MS) {
      await welcome(found.user.id, user, [...ids].map((id) => `<#${id}>`));
    }
  }
  return handled;
}
