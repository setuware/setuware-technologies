import { buttons, esc, paragraph, renderEmail, type EmailContent } from "@/lib/email-kit";
import { emailConfigured, getTransporter, senderAddress } from "@/lib/lead-email";
import { site } from "@/lib/site";

/** Account e-mails (invites, password resets). Resolves to whether it was sent. */
export async function sendAccountEmail(to: string, subject: string, lines: string[], link: { url: string; label: string }): Promise<boolean> {
  if (!emailConfigured()) return false;
  const text = [...lines, "", `${link.label}: ${link.url}`, "", `${site.name}`].join("\n");
  const html = renderEmail({
    subject,
    preheader: lines[0] ?? subject,
    tag: site.portalName,
    heading: subject,
    blocks: [...lines.map((line) => paragraph(esc(line))), buttons([{ url: link.url, label: link.label }]), paragraph(`<span style="font-size:12px;color:#5b6577;">If the button does not work, copy this link into your browser:<br><span style="color:#2f56d8;word-break:break-all;">${esc(link.url)}</span></span>`)],
    reason: `You are receiving this email because you have an account in ${site.portalName}. If you did not expect it you can ignore it.`,
  });
  try {
    await getTransporter().sendMail({ from: { name: site.portalName, address: senderAddress() }, to, subject, text, html });
    return true;
  } catch (error) {
    console.error("[admin] account email failed", error instanceof Error ? error.message : error);
    return false;
  }
}

/** A ready-made account e-mail (see ./account-emails.ts). Resolves to whether it was sent. */
export async function sendEmail(to: string, content: EmailContent, replyTo?: string): Promise<boolean> {
  if (!emailConfigured()) return false;
  try {
    await getTransporter().sendMail({ from: { name: site.portalName, address: senderAddress() }, to, ...(replyTo ? { replyTo } : {}), ...content });
    return true;
  } catch (error) {
    console.error("[admin] account email failed", error instanceof Error ? error.message : error);
    return false;
  }
}
