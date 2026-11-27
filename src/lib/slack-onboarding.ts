import { can, listUsers, type AdminUser } from "./cms/auth";
import { getDb } from "./cms/db";
import { adminUrl, card, SLACK_CHANNELS, slackApi, slackChannelTarget, slackConfigured, type SlackChannel } from "./slack";

/**
 * Slack onboarding and offboarding. Every cron run looks up team members not
 * yet linked to Slack by their admin email; once someone has joined the
 * workspace the bot adds them to the channels their permissions call for
 * and, for people added in the last 60 days, sends a welcome DM. Linked
 * members are reconciled on every run: channels they gained are added, and
 * channels the bot added that they no longer qualify for (role change,
 * access disabled, account removed) are taken away. State lives in
 * `settings` under `slack-member:<user id>`.
 */

const MARK = "slack-member:";
const LOOKUPS_PER_RUN = 10;
const WELCOME_WITHIN_MS = 60 * 86_400_000;

/**
 * The channels a person's permissions call for. Record channels need the
 * matching "see every record" permission, since Slack can't filter per record.
 */
export function channelsFor(user: Pick<AdminUser, "permissions">): SlackChannel[] {
  const any = (...permissions: string[]) => permissions.some((permission) => can(user, permission));
  const channels: SlackChannel[] = ["team", "announcements", "wins"];
  if (any("enquiries.all", "leads.all")) channels.push("leads");
  if (any("applications.all")) channels.push("hiring");
  if (any("posts.view", "subscribers.view")) channels.push("marketing");
  if (any("settings.manage", "users.manage", "roles.manage")) channels.push("alerts", "security");
  return channels;
}

let channelIds = new Map<string, string>();

/** Loads every channel name the bot can see. False when Slack can't be reached. */
async function loadChannels(): Promise<boolean> {
  const found = new Map<string, string>();
  let cursor = "";
  do {
    const page = await slackApi<{ channels?: { id: string; name: string }[]; response_metadata?: { next_cursor?: string } }>("conversations.list", {
      types: "public_channel,private_channel",
      exclude_archived: "true",
      limit: "1000",
      cursor: cursor || undefined,
    });
    if (!page?.ok) return false;
    for (const channel of page.channels ?? []) found.set(channel.name, channel.id);
    cursor = page.response_metadata?.next_cursor ?? "";
  } while (cursor);
  channelIds = found;
  return true;
}

function channelId(target: string): string | null {
  if (/^[CG][A-Z0-9]{6,}$/.test(target)) return target;
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

interface Link {
  slack: string;
  at: string;
  channels: Held[];
  /** Set once a disabled or removed account has been taken out of every website channel. */
  off?: boolean;
}

/** A channel the member is in, and the website channel it was granted for. */
interface Held {
  id: string;
  key: SlackChannel;
}

const allowedFor = (user: AdminUser | undefined): Set<SlackChannel> => new Set(user?.active ? channelsFor(user) : []);

function wantedChannels(user: AdminUser | undefined, uses: Map<string, SlackChannel[]>): Held[] {
  if (!user?.active) return [];
  const allowed = allowedFor(user);
  const held: Held[] = [];
  for (const key of channelsFor(user)) {
    const target = slackChannelTarget(key);
    const id = target ? channelId(target) : null;
    if (id && !held.some((item) => item.id === id) && !revokedFrom({ id, key }, allowed, uses)) held.push({ id, key });
  }
  return held;
}

/** Website channels each Slack channel currently carries (the digest rides on whatever channel it shares). */
function channelUses(): Map<string, SlackChannel[]> {
  const uses = new Map<string, SlackChannel[]>();
  for (const key of Object.keys(SLACK_CHANNELS) as SlackChannel[]) {
    if (key === "digest") continue;
    const target = slackChannelTarget(key);
    const id = target ? channelId(target) : null;
    if (id) uses.set(id, [...(uses.get(id) ?? []), key]);
  }
  return uses;
}

/** True when the member no longer qualifies for a channel: lost the permission it was granted for, or it now carries something they can't see. */
const revokedFrom = (item: Held, allowed: ReadonlySet<SlackChannel>, uses: Map<string, SlackChannel[]>) =>
  !allowed.has(item.key) || (uses.get(item.id) ?? []).some((key) => !allowed.has(key));

/**
 * Brings one member's channels in line with their permissions; returns the
 * channels they are in now. Removal goes by the permission each channel was
 * granted for, so a muted (`off`) or re-pointed channel setting still takes
 * away access from someone who lost the permission, and never from someone
 * who kept it.
 */
async function reconcile(slackUser: string, current: Held[], wanted: Held[], allowed: ReadonlySet<SlackChannel>, uses: Map<string, SlackChannel[]>): Promise<Held[]> {
  const held = [...current];
  for (const item of wanted) {
    if (held.some((existing) => existing.id === item.id)) continue;
    const invited = await slackApi("conversations.invite", { channel: item.id, users: slackUser });
    if (invited?.ok || invited?.error === "already_in_channel") held.push(item);
  }
  for (const item of current) {
    if (!revokedFrom(item, allowed, uses)) continue;
    const removed = await slackApi("conversations.kick", { channel: item.id, user: slackUser });
    if (removed?.ok || removed?.error === "not_in_channel") held.splice(held.indexOf(item), 1);
  }
  return held;
}

let lookupOffset = 0;

/** Links new Slack members and keeps everyone's channels current. Returns how many people changed. */
export async function syncSlackMembers(now: Date = new Date()): Promise<number> {
  if (!slackConfigured()) return 0;
  const db = getDb();
  const save = db.prepare("INSERT INTO settings (key,value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  const links = new Map<number, Link>();
  for (const row of db.prepare("SELECT key, value FROM settings WHERE key LIKE ?").all(`${MARK}%`) as { key: string; value: string }[]) {
    try {
      const link = JSON.parse(row.value) as Partial<Link>;
      if (link.slack) links.set(Number(row.key.slice(MARK.length)), { slack: link.slack, at: link.at ?? "", channels: link.channels ?? [], off: link.off });
    } catch {
      /* ignore a damaged marker */
    }
  }
  const users = listUsers();
  const byId = new Map(users.map((user) => [user.id, user]));
  if (!(await loadChannels())) return 0;
  const uses = channelUses();
  let changed = 0;

  for (const [id, link] of links) {
    const user = byId.get(id);
    if (!user?.active) {
      if (link.off) continue;
      // Offboarding sweeps every website channel, including memberships the bot didn't grant.
      const failed = new Set<string>();
      for (const channel of new Set([...uses.keys(), ...link.channels.map((held) => held.id)])) {
        const removed = await slackApi("conversations.kick", { channel, user: link.slack });
        if (!(removed?.ok || removed?.error === "not_in_channel")) failed.add(channel);
      }
      const channels = link.channels.filter((held) => failed.has(held.id));
      save.run(`${MARK}${id}`, JSON.stringify({ ...link, channels, off: failed.size === 0 }));
      changed += 1;
      continue;
    }
    const wanted = wantedChannels(user, uses);
    const allowed = allowedFor(user);
    const missing = wanted.some((item) => !link.channels.some((held) => held.id === item.id));
    const revoked = link.channels.some((held) => revokedFrom(held, allowed, uses));
    if (!missing && !revoked) continue;
    const channels = await reconcile(link.slack, link.channels, wanted, allowed, uses);
    if (channels.length === link.channels.length && channels.every((item, index) => item === link.channels[index])) continue;
    save.run(`${MARK}${id}`, JSON.stringify({ ...link, channels, off: false }));
    changed += 1;
  }

  const unlinked = users.filter((user) => user.active && user.email && !links.has(user.id)).reverse();
  if (lookupOffset >= unlinked.length) lookupOffset = 0;
  const batch = [...unlinked.slice(lookupOffset), ...unlinked.slice(0, lookupOffset)].slice(0, LOOKUPS_PER_RUN);
  lookupOffset += batch.length;
  for (const user of batch) {
    const found = await slackApi<{ user?: { id: string } }>("users.lookupByEmail", { email: user.email });
    if (!found?.ok || !found.user) continue;
    const channels = await reconcile(found.user.id, [], wantedChannels(user, uses), allowedFor(user), uses);
    save.run(`${MARK}${user.id}`, JSON.stringify({ slack: found.user.id, at: now.toISOString(), channels }));
    changed += 1;
    if (now.getTime() - Date.parse(user.created_at) < WELCOME_WITHIN_MS) {
      await welcome(found.user.id, user, channels.map((channel) => `<#${channel.id}>`));
    }
  }
  return changed;
}
