import { createHash } from "node:crypto";

import { addDays, listRequests, localDay, localTime } from "./cms/attendance";
import { getDb } from "./cms/db";
import { once } from "./cms/notifications";
import { leadView, quoteText } from "./email-templates";
import type { Lead } from "./leads";
import { adminUrl, card, esc, istTime, mailto, queueSlack, sendSlack, slackConfigured, slackChannelTarget, tel, whatsappUrl } from "./slack";

/**
 * What the site tells Slack, one function per kind of event. Each is safe to
 * call whether or not Slack is set up (see ./slack.ts).
 */

const LEAD_TITLES: Record<Lead["kind"], string> = {
  contact: "New project enquiry",
  estimate: "New estimate request",
  booking: "Consultation booked",
  newsletter: "New newsletter subscriber",
};

/* Leads ------------------------------------------------------------------- */

/** Posts an enquiry to #leads, or a newsletter sign-up to #marketing. */
export async function slackLead(lead: Lead): Promise<boolean> {
  if (!slackConfigured()) return false;
  const v = leadView(lead);
  if (lead.kind === "newsletter") {
    return sendSlack(
      "marketing",
      card(`New newsletter subscriber: ${v.email}`, {
        title: "New newsletter subscriber",
        summary: `${mailto(v.email)} joined the newsletter.`,
        buttons: [{ text: "Open subscribers", url: adminUrl("/admin/subscribers"), primary: true }],
        context: [esc(v.source), istTime(lead.receivedAt)],
      }),
    );
  }

  const who = v.name || v.email || "A visitor";
  const whatsapp = whatsappUrl(v.phone);
  const adminPath = lead.kind === "booking" ? "/admin/bookings" : `/admin/enquiries?q=${encodeURIComponent(v.email || v.name)}`;
  return sendSlack(
    "leads",
    card(`${LEAD_TITLES[lead.kind]} from ${who}`, {
      title: `${LEAD_TITLES[lead.kind]}${v.name ? ` · ${v.name}` : ""}`,
      summary: v.slot ? `*${esc(v.slot)}*${v.mode ? ` · ${esc(v.mode)}, 30 minutes` : ""}` : undefined,
      fields: [
        ["Name", esc(v.name)],
        ["Company", esc(v.company)],
        ["Email", mailto(v.email)],
        ["Phone", v.phone ? tel(v.phone) : ""],
        ["Service", esc(v.service)],
        ["Budget", esc(v.budget)],
        ["Estimate shown", v.quote ? esc(quoteText(v.quote)) : ""],
      ],
      quote: v.message,
      buttons: [
        { text: "Open in admin", url: adminUrl(adminPath), primary: true },
        ...(whatsapp ? [{ text: "WhatsApp", url: whatsapp }] : []),
      ],
      context: [esc(v.source), `Ref \`${esc(lead.reference)}\``, istTime(lead.receivedAt)],
    }),
  );
}

/* Hiring ------------------------------------------------------------------ */

export function slackApplication(input: { id: number; jobTitle: string; name: string; email: string; phone: string; links: string; note: string }): void {
  const whatsapp = whatsappUrl(input.phone);
  queueSlack(
    "hiring",
    card(`New application for ${input.jobTitle} from ${input.name}`, {
      title: `New application · ${input.jobTitle}`,
      fields: [
        ["Name", esc(input.name)],
        ["Role", esc(input.jobTitle)],
        ["Email", mailto(input.email)],
        ["Phone", tel(input.phone)],
        ["Links", esc(input.links)],
      ],
      quote: input.note,
      buttons: [
        { text: "Review application", url: adminUrl(`/admin/applications/${input.id}`), primary: true },
        ...(whatsapp ? [{ text: "WhatsApp", url: whatsapp }] : []),
      ],
      context: ["CV attached in the admin", istTime()],
    }),
  );
}

export function slackJobChange(job: { id: number; title: string; slug: string; location: string; type: string }, change: "opened" | "closed", actor: string): void {
  const opened = change === "opened";
  queueSlack(
    "hiring",
    card(`${job.title} is ${opened ? "now live on the careers page" : "closed"}`, {
      title: opened ? `Now hiring · ${job.title}` : `Role closed · ${job.title}`,
      summary: `${esc(actor)} ${opened ? "opened" : "closed"} *${esc(job.title)}* (${esc(job.type)}, ${esc(job.location)}).`,
      buttons: [
        ...(opened ? [{ text: "View job post", url: adminUrl(`/careers/${job.slug}`), primary: true }] : []),
        { text: "Open in admin", url: adminUrl(`/admin/jobs/${job.id}`) },
      ],
      context: [istTime()],
    }),
  );
}

/* Marketing --------------------------------------------------------------- */

export function slackPostPublished(post: { id: number; title: string; slug: string; excerpt: string; author: string }): void {
  queueSlack(
    "marketing",
    card(`New blog post published: ${post.title}`, {
      title: "New blog post published",
      summary: `*${esc(post.title)}*\nby ${esc(post.author)}`,
      quote: post.excerpt,
      buttons: [
        { text: "Read the post", url: adminUrl(`/blog/${post.slug}`), primary: true },
        { text: "Edit", url: adminUrl(`/admin/posts/${post.id}`) },
      ],
      context: ["Share it on LinkedIn and in the newsletter", istTime()],
    }),
  );
}

/* Team operations --------------------------------------------------------- */

export function slackTeam(title: string, summary: string, button?: { text: string; path: string }, details?: string): void {
  queueSlack(
    "team",
    card(title, {
      title,
      summary,
      quote: details,
      buttons: button ? [{ text: button.text, url: adminUrl(button.path), primary: true }] : [],
      context: [istTime()],
    }),
  );
}

/* Security ---------------------------------------------------------------- */

export function slackSecurity(title: string, summary: string, details: [string, string | undefined | null][] = []): void {
  queueSlack(
    "security",
    card(title, {
      title,
      summary,
      fields: details.map(([label, value]) => [label, value ? esc(value) : ""]),
      buttons: [{ text: "Open team & access", url: adminUrl("/admin/users"), primary: true }],
      context: [istTime()],
    }),
  );
}

/** Alerts the first time a person signs in from a browser not seen for them in the last 45 days. */
export function slackSignIn(user: { id: number; name: string; email: string }, device: { userAgent?: string; ip?: string }): void {
  if (!slackConfigured() || !slackChannelTarget("security")) return;
  const fingerprint = createHash("sha256").update(device.userAgent ?? "unknown").digest("hex").slice(0, 16);
  try {
    if (!once(`slack-device:${user.id}:${fingerprint}`)) return;
  } catch {
    return;
  }
  slackSecurity(`Sign-in from a new device · ${user.name}`, `${esc(user.name)} (${esc(user.email)}) signed in to the admin from a browser not seen for them recently.`, [
    ["Browser", describeAgent(device.userAgent)],
    ["IP address", device.ip],
  ]);
}

function describeAgent(agent = ""): string {
  const browser = /Edg\//.test(agent) ? "Edge" : /OPR\//.test(agent) ? "Opera" : /Chrome\//.test(agent) ? "Chrome" : /Firefox\//.test(agent) ? "Firefox" : /Safari\//.test(agent) ? "Safari" : "Unknown browser";
  const os = /iPhone|iPad/.test(agent) ? "iOS" : /Android/.test(agent) ? "Android" : /Windows/.test(agent) ? "Windows" : /Mac OS X/.test(agent) ? "macOS" : /Linux/.test(agent) ? "Linux" : "";
  return os ? `${browser} on ${os}` : browser;
}

/* Site alerts ------------------------------------------------------------- */

const recentAlerts = new Map<string, number>();
const ALERT_QUIET_MS = 15 * 60_000;

/** Posts to #site-alerts, at most once per `key` every 15 minutes (per server process). */
export function slackAlert(key: string, title: string, summary: string, details?: string): boolean {
  if (!slackConfigured() || !slackChannelTarget("alerts")) return false;
  const now = Date.now();
  const last = recentAlerts.get(key);
  if (last && now - last < ALERT_QUIET_MS) return false;
  recentAlerts.set(key, now);
  if (recentAlerts.size > 200) recentAlerts.delete(recentAlerts.keys().next().value as string);
  queueSlack("alerts", card(`${title}: ${summary}`, { title: `⚠️ ${title}`, summary, quote: details, context: [`<${adminUrl("/")}|${esc(new URL(adminUrl("/")).host)}>`, istTime()] }));
  return true;
}

/* Daily digest ------------------------------------------------------------ */

const count = (sql: string, ...params: (string | number)[]) => (getDb().prepare(sql).get(...params) as { n: number | null }).n ?? 0;

/** The morning summary: yesterday's numbers and what is waiting. Sent once a day after 9:00 IST. */
export async function slackDigest(now: Date = new Date()): Promise<boolean> {
  if (!slackConfigured() || !slackChannelTarget("digest")) return false;
  if (localTime(now.toISOString()) < "09:00") return false;
  const today = localDay(now);
  if (!once(`slack-digest:${today}`)) return false;

  const yesterday = addDays(today, -1);
  const from = new Date(`${yesterday}T00:00:00+05:30`).toISOString();
  const to = new Date(`${today}T00:00:00+05:30`).toISOString();
  const db = getDb();
  const kinds = Object.fromEntries(
    (db.prepare("SELECT kind, COUNT(*) AS n FROM enquiries WHERE created_at >= ? AND created_at < ? GROUP BY kind").all(from, to) as { kind: string; n: number }[]).map((row) => [row.kind, row.n]),
  ) as Record<string, number>;
  const enquiries = (kinds.contact ?? 0) + (kinds.estimate ?? 0);
  const bookings = kinds.booking ?? 0;
  const applications = count("SELECT COUNT(*) AS n FROM applications WHERE created_at >= ? AND created_at < ?", from, to);
  const subscribers = count("SELECT COUNT(*) AS n FROM subscribers WHERE created_at >= ? AND created_at < ?", from, to);
  const visits = count("SELECT COALESCE(SUM(views),0) AS n FROM page_views_daily WHERE day = ?", yesterday);
  const team = count("SELECT COUNT(*) AS n FROM users WHERE active = 1");
  const present = count("SELECT COUNT(*) AS n FROM attendance WHERE day = ?", yesterday);

  const newEnquiries = count("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'new'");
  const newApplications = count("SELECT COUNT(*) AS n FROM applications WHERE status = 'new'");
  const pending = count("SELECT COUNT(*) AS n FROM leave_requests WHERE status = 'pending'");
  const overdue = count("SELECT COUNT(*) AS n FROM tasks WHERE status != 'done' AND due_date IS NOT NULL AND due_date < ?", today);
  const onLeave = listRequests({ status: "approved", from: today, to: today })
    .filter((request) => request.kind === "leave")
    .map((request) => request.user_name);

  const label = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${yesterday}T12:00:00Z`));
  const message = card(`Daily summary for ${label}`, {
    title: `Daily summary · ${label}`,
    fields: [
      ["New enquiries", String(enquiries)],
      ["Consultations booked", String(bookings)],
      ["Job applications", String(applications)],
      ["Newsletter sign-ups", String(subscribers)],
      ["Page views", visits.toLocaleString("en-IN")],
      ["Attendance", team ? `${present} of ${team} checked in` : ""],
    ],
    summary: undefined,
  });
  const waiting = [
    newEnquiries ? `• *${newEnquiries}* ${newEnquiries === 1 ? "enquiry" : "enquiries"} not yet contacted` : "",
    newApplications ? `• *${newApplications}* ${newApplications === 1 ? "application" : "applications"} to review` : "",
    pending ? `• *${pending}* leave or attendance ${pending === 1 ? "request" : "requests"} awaiting approval` : "",
    overdue ? `• *${overdue}* overdue ${overdue === 1 ? "task" : "tasks"}` : "",
    onLeave.length ? `• On leave today: ${onLeave.map(esc).join(", ")}` : "",
  ].filter(Boolean);
  const blocks = message.blocks ?? [];
  blocks.push({ type: "divider" });
  blocks.push({ type: "section", text: { type: "mrkdwn", text: waiting.length ? `*Waiting on the team*\n${waiting.join("\n")}` : "*Waiting on the team*\nNothing pending. 🎉" } });
  blocks.push({ type: "actions", elements: [{ type: "button", text: { type: "plain_text", text: "Open the dashboard" }, url: adminUrl("/admin"), style: "primary" }] });
  return sendSlack("digest", { text: message.text, blocks });
}
