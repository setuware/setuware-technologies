import { after } from "next/server";

import { site } from "./site";

/**
 * Slack notifications.
 *
 * One Slack app (bot token `SLACK_BOT_TOKEN`, scopes `chat:write` and
 * `chat:write.public`) posts each kind of event to its own channel. Channels
 * default to the names below; set `SLACK_CHANNEL_<NAME>` to a channel ID or
 * name to change one, or to `off` to silence it. Without a token nothing is
 * sent. A slow or failing Slack never fails the request that triggered it.
 * Setup: docs/slack.md.
 */

export const SLACK_CHANNELS = {
  leads: { env: "SLACK_CHANNEL_LEADS", fallback: "#leads" },
  hiring: { env: "SLACK_CHANNEL_HIRING", fallback: "#hiring" },
  team: { env: "SLACK_CHANNEL_TEAM", fallback: "#team-ops" },
  alerts: { env: "SLACK_CHANNEL_ALERTS", fallback: "#site-alerts" },
  security: { env: "SLACK_CHANNEL_SECURITY", fallback: "#security" },
  marketing: { env: "SLACK_CHANNEL_MARKETING", fallback: "#marketing" },
  digest: { env: "SLACK_CHANNEL_DIGEST", fallback: "" },
} as const;

export type SlackChannel = keyof typeof SLACK_CHANNELS;

/** Slack Block Kit blocks (kept loose; Slack validates them). */
export type SlackBlock = Record<string, unknown>;

export interface SlackMessage {
  /** Notification and fallback text. */
  text: string;
  blocks?: SlackBlock[];
}

const TIMEOUT_MS = 4_000;

export function slackConfigured(): boolean {
  return Boolean(process.env.SLACK_BOT_TOKEN?.trim());
}

/** Where `channel` posts, or null when it is turned off. The digest falls back to the team channel. */
export function slackChannelTarget(channel: SlackChannel): string | null {
  const { env, fallback } = SLACK_CHANNELS[channel];
  const value = process.env[env]?.trim() || fallback;
  if (!value) return channel === "digest" ? slackChannelTarget("team") : null;
  return value.toLowerCase() === "off" ? null : value;
}

/** Posts a message. Resolves to whether Slack accepted it; never throws. */
export async function sendSlack(channel: SlackChannel, message: SlackMessage): Promise<boolean> {
  const token = process.env.SLACK_BOT_TOKEN?.trim();
  const target = slackChannelTarget(channel);
  if (!token || !target) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8", authorization: `Bearer ${token}` },
      body: JSON.stringify({ channel: target, text: message.text, blocks: message.blocks, unfurl_links: false, unfurl_media: false }),
      signal: controller.signal,
    });
    const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!response.ok || !body.ok) {
      console.error("[slack] rejected", channel, target, body.error ?? response.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[slack] failed", channel, error instanceof Error ? error.message : error);
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

/** Sends after the response has gone out (inside a request), otherwise straight away. */
export function queueSlack(channel: SlackChannel, message: SlackMessage): void {
  if (!slackConfigured() || !slackChannelTarget(channel)) return;
  const task = async () => {
    await sendSlack(channel, message);
  };
  try {
    after(task);
  } catch {
    void task();
  }
}

/* -------------------------------------------------------------------------- */
/* Message building                                                            */
/* -------------------------------------------------------------------------- */

/** Escapes text for Slack mrkdwn, so visitor input cannot add links or @-mentions. */
export function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const clip = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);

export function adminUrl(path: string): string {
  return `${site.url}${path}`;
}

export function istTime(iso: string = new Date().toISOString()): string {
  return (
    new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso)) + " IST"
  );
}

export interface CardButton {
  text: string;
  url: string;
  primary?: boolean;
}

export interface Card {
  /** Header line, plain text. */
  title: string;
  /** Short intro under the header (mrkdwn, caller escapes). */
  summary?: string;
  /** Label/value pairs shown as a two-column grid. Empty values are dropped. */
  fields?: [string, string | undefined | null][];
  /** A longer quoted block, such as the visitor's message. Escaped here. */
  quote?: string;
  buttons?: CardButton[];
  /** Small grey footer items (mrkdwn, caller escapes). */
  context?: string[];
}

/** Builds a consistent Block Kit card: header, summary, fields, quote, buttons, footer. */
export function card(text: string, input: Card): SlackMessage {
  const blocks: SlackBlock[] = [{ type: "header", text: { type: "plain_text", text: clip(input.title, 150), emoji: true } }];
  if (input.summary) blocks.push({ type: "section", text: { type: "mrkdwn", text: clip(input.summary, 2900) } });
  const fields = (input.fields ?? []).filter((field): field is [string, string] => Boolean(field[1]));
  for (let i = 0; i < fields.length; i += 10) {
    blocks.push({
      type: "section",
      fields: fields.slice(i, i + 10).map(([label, value]) => ({ type: "mrkdwn", text: clip(`*${label}*\n${value}`, 2000) })),
    });
  }
  if (input.quote?.trim()) {
    const quoted = clip(input.quote.trim(), 2800)
      .split("\n")
      .map((line) => `>${esc(line)}`)
      .join("\n");
    blocks.push({ type: "section", text: { type: "mrkdwn", text: quoted } });
  }
  const buttons = (input.buttons ?? []).filter((button) => /^https?:\/\//.test(button.url)).slice(0, 5);
  if (buttons.length) {
    blocks.push({
      type: "actions",
      elements: buttons.map((button) => ({
        type: "button",
        text: { type: "plain_text", text: button.text, emoji: true },
        url: button.url,
        ...(button.primary ? { style: "primary" } : {}),
      })),
    });
  }
  if (input.context?.length) {
    blocks.push({ type: "context", elements: input.context.filter(Boolean).map((item) => ({ type: "mrkdwn", text: clip(item, 300) })) });
  }
  return { text: clip(text, 3000), blocks };
}

export function mailto(email: string): string {
  return email ? `<mailto:${encodeURI(email)}|${esc(email)}>` : "";
}

const phoneDigits = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
};

export function tel(phone: string): string {
  const digits = phoneDigits(phone);
  return digits ? `<tel:+${digits}|${esc(phone)}>` : esc(phone);
}

export function whatsappUrl(phone: string): string {
  const digits = phoneDigits(phone);
  return digits.length >= 11 ? `https://wa.me/${digits}` : "";
}
