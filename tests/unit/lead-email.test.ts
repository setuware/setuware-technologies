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
