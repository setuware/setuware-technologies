import { randomInt } from "node:crypto";

import { buttons, detailCard, esc, paragraph, renderEmail, steps, type EmailContent } from "@/lib/email-kit";
import { site } from "@/lib/site";

/**
 * Account e-mails for the team: login details, invite link and welcome note.
 * Table layout with inline styles so they render the same in Gmail, Outlook
 * and Apple Mail. Every value goes through `esc`.
 */

const first = (name: string) => name.trim().split(/\s+/)[0] ?? name;
const host = () => site.url.replace(/^https?:\/\//, "");
export const loginUrl = () => `${site.url}/admin/login`;

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
  tag?: string;
  heading: string;
  intro: string[];
  panel?: { title: string; rows: Row[] };
  button?: { url: string; label: string };
  steps?: { title: string; items: string[] };
  outro?: string[];
  from: string;
}

function render(letter: Letter): EmailContent {
  const html = renderEmail({
    subject: letter.subject,
    preheader: letter.preheader,
    tag: letter.tag,
    heading: letter.heading,
    blocks: [
      ...letter.intro.map((line) => paragraph(esc(line))),
      letter.panel
        ? detailCard(
            letter.panel.title,
            letter.panel.rows.map((row) => ({
              label: row.label,
              html: row.mono ? `<span style="font:700 17px/1.4 'Courier New',Courier,monospace;letter-spacing:.04em;">${esc(row.value)}</span>` : esc(row.value),
            })),
          )
        : "",
      letter.button ? buttons([{ url: letter.button.url, label: letter.button.label }]) : "",
      letter.steps ? steps(letter.steps.title, letter.steps.items.map(esc)) : "",
      ...(letter.outro ?? []).map((line) => paragraph(esc(line))),
    ],
    signature: { name: letter.from, role: site.name },
    reason: `This email was sent to you because an account was created for you in the ${site.name} admin.`,
  });

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
    tag: "Team account",
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
    tag: "Invitation",
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
    tag: "Welcome",
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
