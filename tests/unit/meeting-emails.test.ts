import { describe, expect, it } from "vitest";

import { applicantConfirmationEmail, hrApplicationEmail } from "@/lib/application-emails";
import { renderEmail, textToBlocks } from "@/lib/email-kit";
import { acknowledgementEmail, meetingLinkEmail } from "@/lib/email-templates";
import { bookingInvite } from "@/lib/lead-email";

const booking = {
  kind: "booking" as const,
  reference: "STW-1042",
  receivedAt: "2026-11-27T06:12:00.000Z",
  payload: { name: "Priya <b>Sharma</b>", email: "priya@example.com", phone: "9876543210", slot: "2026-12-01T06:00:00.000Z", mode: "video", topic: "web-development" },
};

describe("consultation emails", () => {
  it("confirms the booking with the date, the time range in IST and the format", () => {
    const email = acknowledgementEmail(booking);
    expect(email?.subject).toContain("Consultation confirmed");
    expect(email?.html).toContain("Tuesday, 1 December 2026");
    expect(email?.html).toContain("11:30 am – 12:00 pm IST");
    expect(email?.html).toContain("Video call (Google Meet)");
    // One event only: the attached invite, which the join-link email later updates.
    expect(email?.html).not.toContain("calendar.google.com");
    expect(email?.html).not.toContain("/book");
    expect(email?.text).toContain("Need to change the time?");
  });

  it("tells a phone booking which number will be called", () => {
    const email = acknowledgementEmail({ ...booking, payload: { ...booking.payload, mode: "phone" } });
    expect(email?.html).toContain("9876543210");
    expect(email?.html).not.toContain("Meeting link");
  });

  it("sends the join link with an updated invite", () => {
    const url = "https://meet.google.com/abc-defg-hij";
    const email = meetingLinkEmail(booking, url, "Satyam Raj");
    expect(email?.subject).toContain("Join link");
    expect(email?.html).toContain(`href="${url}"`);
    expect(email?.html).not.toContain("<b>Sharma</b>");
    expect(email?.text).toContain(`Join link: ${url}`);
    const invite = bookingInvite(booking, url)?.content ?? "";
    expect(invite).toContain(`URL:${url}`);
    expect(invite).toContain("SEQUENCE:1");
    expect(bookingInvite(booking)?.content).toContain("SEQUENCE:0");
  });

  it("returns nothing for an enquiry without a slot", () => {
    expect(meetingLinkEmail({ ...booking, kind: "contact", payload: { email: "a@b.co" } }, "https://meet.google.com/x")).toBeNull();
  });
});

describe("application emails", () => {
  const application = { name: "Rahul <i>Verma</i>", email: "rahul@example.com", phone: "9876543210", note: "Available from January.", jobTitle: "Frontend Developer", jobSlug: "frontend-developer" };

  it("gives HR the applicant's details and escapes them", () => {
    const email = hrApplicationEmail(application);
    expect(email.subject).toBe("Application: Frontend Developer · Rahul <i>Verma</i>");
    expect(email.html).toContain("Rahul &lt;i&gt;Verma&lt;/i&gt;");
    expect(email.html).toContain("Available from January.");
    expect(email.html).toContain("/admin/applications");
  });

  it("confirms receipt to the applicant with the next steps", () => {
    const email = applicantConfirmationEmail(application);
    expect(email.subject).toContain("Frontend Developer");
    expect(email.html).toContain("What happens next");
    expect(email.text).toContain("Hi Rahul,");
  });
});

describe("email kit", () => {
  it("turns a typed message into escaped paragraphs with links", () => {
    const blocks = textToBlocks("Hi <Asha>,\n\nBook here: https://setuware.in/book.\nThanks");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toContain("Hi &lt;Asha&gt;,");
    expect(blocks[1]).toContain('href="https://setuware.in/book"');
    expect(blocks[1]).toContain("<br>");
  });

  it("keeps quotes and angle brackets around a URL out of the link", () => {
    const [block] = textToBlocks('Join <https://meet.google.com/abc-defg-hij> or "https://setuware.in/a?b=1&c=2".');
    expect(block).toContain('href="https://meet.google.com/abc-defg-hij"');
    expect(block).toContain('href="https://setuware.in/a?b=1&amp;c=2"');
    expect(block).not.toContain("hij&gt;");
    expect(block).not.toContain('2&quot;"');
  });

  it("renders a full document with the preheader and heading", () => {
    const html = renderEmail({ subject: "Subject", preheader: "Preview line", heading: "Hello", blocks: ["<p>Body</p>"] });
    expect(html.startsWith("<!doctype html>")).toBe(true);
    expect(html).toContain("Preview line");
    expect(html).toContain("Hello");
  });
});
