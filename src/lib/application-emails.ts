import { buttons, detailCard, esc, link, paragraph, quote, renderEmail, siteHost, steps, type DetailRow, type EmailContent } from "./email-kit";
import { site } from "./site";

/** E-mails for job applications: the note HR receives and the applicant's confirmation. */

export interface ApplicationDetails {
  name: string;
  email: string;
  phone: string;
  links?: string;
  note?: string;
  jobTitle: string;
  jobSlug: string;
}

const first = (name: string) => name.trim().split(/\s+/)[0] ?? name;

export function hrApplicationEmail(application: ApplicationDetails): EmailContent {
  const subject = `Application: ${application.jobTitle} · ${application.name}`;
  const rows: DetailRow[] = [
    { label: "Role", html: esc(application.jobTitle) },
    { label: "Name", html: esc(application.name) },
    { label: "Email", html: link(`mailto:${application.email}`, application.email) },
    { label: "Phone", html: esc(application.phone) },
    ...(application.links ? [{ label: "Links", html: esc(application.links) }] : []),
  ];
  const admin = `${site.portalUrl}/admin/applications`;
  return {
    subject,
    html: renderEmail({
      subject,
      preheader: `${application.name} applied for ${application.jobTitle}. The CV is attached.`,
      tag: "New application",
      heading: `${application.name} applied for ${application.jobTitle}`,
      subheading: "The CV is attached to this email.",
      blocks: [
        detailCard("Applicant", rows),
        application.note ? `<div style="margin:0 0 10px;font:700 15px/1.4 Arial,sans-serif;color:#0b1020;">Note from the applicant</div>${quote(application.note)}` : "",
        buttons([{ url: admin, label: "Review in the admin" }, { url: `mailto:${application.email}`, label: "Reply by email", tone: "outline" }]),
      ],
      reason: `Sent automatically by the careers page on ${siteHost()}.`,
    }),
    text: [
      `${application.name} applied for ${application.jobTitle}.`,
      "",
      `Email: ${application.email}`,
      `Phone: ${application.phone}`,
      ...(application.links ? [`Links: ${application.links}`] : []),
      ...(application.note ? ["", application.note] : []),
      "",
      `Review it in the admin: ${admin}`,
    ].join("\n"),
  };
}

export function applicantConfirmationEmail(application: ApplicationDetails): EmailContent {
  const subject = `We have received your application for ${application.jobTitle}`;
  const jobUrl = `${site.url}/careers/${application.jobSlug}`;
  const next = [
    "Our team reads every application, usually within five working days.",
    "If your profile fits the role, we email you to arrange a first conversation.",
    "Shortlisted candidates complete a short practical exercise, followed by a final discussion.",
  ];
  return {
    subject,
    html: renderEmail({
      subject,
      preheader: `Thank you for applying to ${site.name}. Here is what happens next.`,
      tag: "Application received",
      heading: "We have received your application",
      subheading: application.jobTitle,
      blocks: [
        paragraph(`Hi ${esc(first(application.name))},`),
        paragraph(`Thank you for applying for the <strong>${esc(application.jobTitle)}</strong> role at ${esc(site.name)}. Your application and CV have reached our hiring team.`),
        detailCard("Your application", [
          { label: "Role", html: link(jobUrl, application.jobTitle) },
          { label: "Name", html: esc(application.name) },
          { label: "Email", html: esc(application.email) },
          { label: "Phone", html: esc(application.phone) },
        ]),
        steps("What happens next", next.map(esc)),
        paragraph(`If you need to update your application or send a newer CV, reply to this email or write to ${link(`mailto:${site.hrEmail}`, site.hrEmail)}.`),
      ],
      signature: { name: "The hiring team", role: site.name },
      reason: `You are receiving this email because you applied for a role on ${siteHost()}.`,
    }),
    text: [
      `Hi ${first(application.name)},`,
      `Thank you for applying for the ${application.jobTitle} role at ${site.name}. Your application and CV have reached our hiring team.`,
      `What happens next\n${next.map((item, index) => `${index + 1}. ${item}`).join("\n")}`,
      `If you need to update your application or send a newer CV, reply to this email or write to ${site.hrEmail}.`,
      `Regards,\nThe hiring team\n${site.name}`,
    ].join("\n\n"),
  };
}
