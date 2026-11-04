import { emailConfigured, getTransporter, senderAddress } from "@/lib/lead-email";
import { site } from "@/lib/site";

/** Account e-mails (invites, password resets). Resolves to whether it was sent. */
export async function sendAccountEmail(to: string, subject: string, lines: string[], link: { url: string; label: string }): Promise<boolean> {
  if (!emailConfigured()) return false;
  const text = [...lines, "", `${link.label}: ${link.url}`, "", `${site.name}`].join("\n");
  const html = `<!doctype html><html><body style="margin:0;padding:24px 12px;background:#f6f8fb;font-family:Arial,sans-serif;color:#111827;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="width:520px;max-width:100%;background:#ffffff;border:1px solid #e6eaf0;border-top:3px solid #2f56d8;border-radius:14px;">
<tr><td style="padding:28px;">
<div style="font:800 17px/1 Arial,sans-serif;letter-spacing:.06em;color:#0891b2;">SETUWARE <span style="font:700 10px Arial;letter-spacing:.3em;color:#64748b;">ADMIN</span></div>
${lines.map((line) => `<p style="margin:16px 0 0;font:400 15px/1.6 Arial,sans-serif;">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`).join("")}
<p style="margin:24px 0 0;"><a href="${link.url}" style="display:inline-block;background:#2f56d8;color:#ffffff;text-decoration:none;font:700 14px Arial,sans-serif;padding:12px 22px;border-radius:999px;">${link.label}</a></p>
<p style="margin:20px 0 0;font:400 12px/1.6 Arial,sans-serif;color:#4b5563;">If the button does not work, copy this link into your browser:<br><span style="color:#2f56d8;word-break:break-all;">${link.url}</span></p>
</td></tr></table>
<p style="margin:14px 0 0;font:400 12px Arial,sans-serif;color:#4b5563;">${site.name} · If you did not expect this email you can ignore it.</p>
</td></tr></table></body></html>`;
  try {
    await getTransporter().sendMail({ from: { name: `${site.name} Admin`, address: senderAddress() }, to, subject, text, html });
    return true;
  } catch (error) {
    console.error("[admin] account email failed", error instanceof Error ? error.message : error);
    return false;
  }
}
