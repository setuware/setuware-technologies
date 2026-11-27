import { randomInt } from "node:crypto";

import type { EmailContent } from "@/lib/email-templates";
import { site } from "@/lib/site";

/**
 * Account e-mails for the team: login details, invite link and welcome note.
 * Table layout with inline styles so they render the same in Gmail, Outlook
 * and Apple Mail. Every value goes through `esc`.
 */

const esc = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

const first = (name: string) => name.trim().split(/\s+/)[0] ?? name;
const host = () => site.url.replace(/^https?:\/\//, "");
export const loginUrl = () => `${site.portalUrl}/admin/login`;

/** Letters without look-alikes (no I, l, O, 0, 1). */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";

/** A readable temporary password like `Kq7m-xT3p-Rw9a`: 12 random characters, always letters and digits. */
export function generatePassword(): string {
  const groups = Array.from({ length: 3 }, () => {
    const chars = Array.from({ length: 4 }, (_, index) => (index === 2 ? DIGITS : ALPHABET + DIGITS));
    return chars.map((set) => set[randomInt(set.length)]).join("");
  });
  return groups.join("-");
}

interface Row {
  label: string;
  value: string;
  mono?: boolean;
}

interface Letter {
  subject: string;
  preheader: string;
  heading: string;
  intro: string[];
  panel?: { title: string; rows: Row[] };
  button?: { url: string; label: string };
  steps?: { title: string; items: string[] };
  outro?: string[];
  from: string;
}

function render(letter: Letter): EmailContent {
  const P = "margin:0 0 14px;font:400 15px/1.65 Arial,sans-serif;color:#1f2937;";
  const panel = letter.panel
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px;background:#f4f7ff;border:1px solid #d6e0fb;border-radius:12px;">
<tr><td style="padding:16px 20px 6px;font:700 11px/1 Arial,sans-serif;letter-spacing:.14em;color:#2f56d8;">${esc(letter.panel.title.toUpperCase())}</td></tr>
${letter.panel.rows
  .map(
    (row) => `<tr><td style="padding:8px 20px;"><div style="font:400 12px/1.4 Arial,sans-serif;color:#64748b;">${esc(row.label)}</div><div style="margin-top:2px;font:${row.mono ? "700 17px/1.4 'Courier New',Courier,monospace;letter-spacing:.04em" : "700 15px/1.45 Arial,sans-serif"};color:#0b1020;word-break:break-all;">${esc(row.value)}</div></td></tr>`,
  )
  .join("\n")}
<tr><td style="padding:0 0 10px;"></td></tr></table>`
    : "";
  const button = letter.button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 22px;"><tr><td bgcolor="#2f56d8" style="border-radius:999px;"><a href="${esc(letter.button.url)}" style="display:inline-block;padding:13px 26px;font:700 14px/1 Arial,sans-serif;color:#ffffff;text-decoration:none;border-radius:999px;">${esc(letter.button.label)} &rarr;</a></td></tr></table>`
    : "";
  const steps = letter.steps
    ? `<div style="margin:0 0 10px;font:700 14px/1.4 Arial,sans-serif;color:#0b1020;">${esc(letter.steps.title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
${letter.steps.items
  .map(
    (item, index) => `<tr><td valign="top" style="width:30px;padding:0 0 10px;"><div style="width:22px;height:22px;border-radius:999px;background:#2f56d8;color:#ffffff;font:700 12px/22px Arial,sans-serif;text-align:center;">${index + 1}</div></td><td style="padding:1px 0 10px;font:400 14px/1.6 Arial,sans-serif;color:#1f2937;">${esc(item)}</td></tr>`,
  )
  .join("\n")}
</table>`
    : "";

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>${esc(letter.subject)}</title></head>
<body bgcolor="#eef2f8" style="margin:0;padding:0;background:#eef2f8;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(letter.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#eef2f8" style="background:#eef2f8;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="width:580px;max-width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e3e8f0;">
<tr><td bgcolor="#0b1a3a" style="padding:26px 30px;background:#0b1a3a;background-image:linear-gradient(135deg,#0b1a3a 0%,#1d3a8f 60%,#2f56d8 100%);">
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:42px;height:42px;background:#ffffff;border-radius:11px;text-align:center;"><img src="${esc(site.url)}/apple-icon" width="42" height="42" alt="SW" style="display:block;border:0;border-radius:11px;"></td>
<td style="padding-left:12px;"><div style="font:800 18px/1 Arial,sans-serif;letter-spacing:.06em;color:#ffffff;">SETUWARE</div><div style="margin-top:6px;font:700 10px/1 Arial,sans-serif;letter-spacing:.28em;color:#c7d4f5;">TECHNOLOGIES</div></td>
</tr></table>
<div style="margin-top:22px;font:700 23px/1.3 Arial,sans-serif;color:#ffffff;">${esc(letter.heading)}</div>
</td></tr>
<tr><td style="padding:28px 30px 8px;">
${letter.intro.map((line) => `<p style="${P}">${esc(line)}</p>`).join("\n")}
${panel}
${button}
${steps}
${(letter.outro ?? []).map((line) => `<p style="${P}">${esc(line)}</p>`).join("\n")}
</td></tr>
<tr><td style="padding:0 30px 26px;"><p style="margin:0;padding-top:16px;border-top:1px solid #eef1f5;font:400 14px/1.6 Arial,sans-serif;color:#111827;">Regards,<br>${esc(letter.from)}<br><span style="color:#64748b;">${esc(site.name)}</span></p></td></tr>
</table>
<p style="margin:14px 0 0;font:400 12px/1.6 Arial,sans-serif;color:#64748b;">${esc(site.name)} · <a href="${esc(site.url)}" style="color:#64748b;">${esc(host())}</a><br>This email was sent to you because an account was created for you in the ${esc(site.name)} admin.</p>
</td></tr></table></body></html>`;

  const text = [
    letter.heading,
    ...letter.intro,
    ...(letter.panel ? [`${letter.panel.title}\n${letter.panel.rows.map((row) => `${row.label}: ${row.value}`).join("\n")}`] : []),
    ...(letter.button ? [`${letter.button.label}: ${letter.button.url}`] : []),
    ...(letter.steps ? [`${letter.steps.title}\n${letter.steps.items.map((item, index) => `${index + 1}. ${item}`).join("\n")}`] : []),
    ...(letter.outro ?? []),
    `Regards,\n${letter.from}\n${site.name}`,
  ].join("\n\n");

  return { subject: letter.subject, html, text };
}

export interface NewMember {
  name: string;
  email: string;
  roleName: string;
}

/** Sign-in address, email and temporary password; they choose their own password at first sign-in. */
export function credentialsEmail(member: NewMember, password: string, from: string): EmailContent {
  return render({
    subject: `Your ${site.name} admin login details`,
    preheader: `Sign in at ${host()}/admin with the temporary password inside.`,
    heading: "Your login details",
    intro: [
      `Hi ${first(member.name)},`,
      `${from} has created your ${site.name} admin account with ${member.roleName} access. Use the details below to sign in.`,
    ],
    panel: {
      title: "Sign-in details",
      rows: [
        { label: "Sign-in page", value: loginUrl() },
        { label: "Email", value: member.email },
        { label: "Temporary password", value: password, mono: true },
      ],
    },
    button: { url: loginUrl(), label: "Sign in now" },
    outro: [
      "You will be asked to choose your own password the first time you sign in. After that, turn on 2-step verification under My account.",
      "Keep this email private and delete it once you have changed your password. If you did not expect it, reply and let us know.",
    ],
    from,
  });
}

/** Invite link (no password in the email): they choose their password from the link. */
export function inviteEmail(member: NewMember, url: string, from: string): EmailContent {
  return render({
    subject: `${from} invited you to the ${site.name} admin`,
    preheader: "Choose your password to activate your account. The link expires in 3 days.",
    heading: "Set up your account",
    intro: [
      `Hi ${first(member.name)},`,
      `${from} has given you ${member.roleName} access to the ${site.name} admin. Choose your password to activate your account.`,
    ],
    panel: { title: "Your account", rows: [{ label: "Email", value: member.email }, { label: "Sign-in page", value: loginUrl() }] },
    button: { url, label: "Choose my password" },
    outro: ["The link works once and expires in 3 days. If it has expired, ask your admin to send a new one.", `If the button does not work, copy this link into your browser: ${url}`],
    from,
  });
}

export interface WelcomeDetails extends NewMember {
  designation?: string;
  department?: string;
  managerName?: string;
  joinedOn?: string | null;
}

function day(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${iso}T00:00:00+05:30`));
}

/** The welcome note: who they are on the team and what to do on day one. */
export function welcomeEmail(member: WelcomeDetails, from: string): EmailContent {
  const rows: Row[] = [
    ...(member.designation ? [{ label: "Designation", value: member.designation }] : []),
    ...(member.department ? [{ label: "Department", value: member.department }] : []),
    ...(member.managerName ? [{ label: "Reports to", value: member.managerName }] : []),
    ...(member.joinedOn ? [{ label: "Joining date", value: day(member.joinedOn) }] : []),
    { label: "Admin access", value: member.roleName },
  ];
  return render({
    subject: `Welcome to ${site.name}, ${first(member.name)}`,
    preheader: "Your role, your team and what to do on your first day.",
    heading: `Welcome to the team, ${first(member.name)}`,
    intro: [
      `Hi ${first(member.name)},`,
      `We are glad to have you at ${site.name}. Your admin account is ready, and your sign-in details are in a separate email.`,
    ],
    panel: { title: "Your role", rows },
    steps: {
      title: "Your first day",
      items: [
        "Sign in to the admin and choose your own password.",
        "Turn on 2-step verification under My account.",
        "Complete your profile: phone, skills, location and emergency contact.",
        "Check in from the dashboard when you start work, and review the tasks assigned to you.",
      ],
    },
    button: { url: loginUrl(), label: "Open the admin" },
    outro: [`If you have any questions, reply to this email${member.managerName ? ` or reach out to ${member.managerName}` : ""}.`],
    from,
  });
}
