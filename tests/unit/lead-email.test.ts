import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sendMail = vi.fn();
vi.mock("nodemailer", () => ({
  default: { createTransport: vi.fn(() => ({ sendMail })) },
}));

import { emailConfigured, formatLeadEmail } from "@/lib/lead-email";
import { deliverLead } from "@/lib/leads";

const SMTP = {
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: "465",
  SMTP_USER: "no-reply@setuware.in",
  SMTP_PASS: "secret",
};

describe("formatLeadEmail", () => {
  it("lists visible fields, hides internal ones and escapes HTML", () => {
    const { subject, text, html } = formatLeadEmail({
      kind: "contact",
      reference: "STW-TEST",
      receivedAt: "2026-11-02T10:00:00.000Z",
      payload: {
        name: "Priya <b>Sharma</b>",
        email: "priya@example.com",
        service: "Website",
        message: "Five pages",
        consent: true,
        honeypot: "",
        elapsedMs: 4000,
      },
    });

    expect(subject).toBe("New project enquiry from Priya <b>Sharma</b> · STW-TEST");
    expect(text).toContain("Service: Website");
    expect(text).not.toContain("honeypot");
    expect(text).not.toContain("elapsedMs");
    expect(html).toContain("Priya &lt;b&gt;Sharma&lt;/b&gt;");
    expect(html).not.toContain("<b>Sharma</b>");
  });
});

describe("deliverLead e-mail channel", () => {
  beforeEach(() => {
    sendMail.mockReset();
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("is off without SMTP settings", async () => {
    expect(emailConfigured({})).toBe(false);
    const result = await deliverLead("contact", { name: "A", email: "a@example.com" });
    expect(result.delivered).toBe(false);
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("e-mails the lead to LEAD_EMAIL_TO with reply-to set to the visitor", async () => {
    for (const [key, value] of Object.entries(SMTP)) vi.stubEnv(key, value);
    vi.stubEnv("LEAD_EMAIL_TO", "sales@setuware.in");
    sendMail.mockResolvedValue({ messageId: "1" });

    const result = await deliverLead("contact", {
      name: "Priya",
      email: "priya@example.com",
      message: "Hello there",
    });

    expect(result.delivered).toBe(true);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "sales@setuware.in",
        replyTo: "priya@example.com",
        subject: expect.stringContaining("New project enquiry from Priya"),
      }),
    );
  });

  it("reports undelivered (without throwing) when the SMTP send fails", async () => {
    for (const [key, value] of Object.entries(SMTP)) vi.stubEnv(key, value);
    sendMail.mockRejectedValue(new Error("auth failed"));

    const result = await deliverLead("contact", { name: "Priya", email: "p@example.com" });
    expect(result.delivered).toBe(false);
  });
});

describe("e-mail templates", () => {
  it("labels the source and strips internal markers from the message", async () => {
    const { leadView, teamEmail } = await import("@/lib/email-templates");
    const popup = leadView({
      kind: "contact",
      reference: "STW-1",
      receivedAt: "2026-11-03T06:12:00.000Z",
      payload: { name: "Priya", email: "p@example.com", message: "Service: Website.\n\nSix pages.\n\n(Sent from the website enquiry pop-up.)" },
    });
    expect(popup.source).toBe("Enquiry pop-up");
    expect(popup.message).toBe("Six pages.");

    const chat = leadView({
      kind: "contact",
      reference: "STW-2",
      receivedAt: "2026-11-03T06:12:00.000Z",
      payload: { name: "Ravi", email: "r@example.com", service: "business-websites", message: "Enquiry via the website assistant.\nRequirement: Business websites\n\nNeed a site." },
    });
    expect(chat.source).toBe("Website chat assistant");
    expect(chat.message).toBe("Need a site.");
    expect(chat.service).toBe("Business websites");

    const email = teamEmail({ kind: "contact", reference: "STW-2", receivedAt: "2026-11-03T06:12:00.000Z", payload: { name: "Ravi", email: "r@example.com", phone: "98765 43210", message: "Hi there" } });
    expect(email.html).toContain("https://wa.me/919876543210");
    expect(email.html).toContain("IST");
  });

  it("sends a thank-you e-mail to the visitor with the estimate", async () => {
    const { acknowledgementEmail } = await import("@/lib/email-templates");
    const ack = acknowledgementEmail({
      kind: "estimate",
      reference: "STW-3",
      receivedAt: "2026-11-03T06:12:00.000Z",
      payload: { name: "Asha Rao", email: "asha@example.com", quote: { low: 40000, high: 52000, weeks: 5 } },
    });
    expect(ack?.subject).toContain("STW-3");
    expect(ack?.html).toContain("Thank you, Asha.");
    expect(ack?.html).toContain("₹40,000");
    expect(acknowledgementEmail({ kind: "newsletter", reference: "x", receivedAt: "2026-11-03T06:12:00.000Z", payload: { email: "a@b.co" } })).toBeNull();
  });

  it("e-mails both the team and the visitor when SMTP is set", async () => {
    for (const [key, value] of Object.entries(SMTP)) vi.stubEnv(key, value);
    sendMail.mockReset().mockResolvedValue({ messageId: "1" });
    vi.spyOn(console, "info").mockImplementation(() => {});
    await deliverLead("contact", { name: "Priya", email: "priya@example.com", message: "Hello there" });
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(sendMail.mock.calls[1][0]).toMatchObject({ to: "priya@example.com", replyTo: "sales@setuware.in" });
    vi.unstubAllEnvs();
  });
});
