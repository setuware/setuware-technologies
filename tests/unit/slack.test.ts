import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { esc, sendSlack, slackChannelTarget } from "@/lib/slack";
import { slackAlert, slackApplication, slackDigest, slackLead, slackWelcome, slackWin } from "@/lib/slack-events";
import { channelsFor, syncSlackMembers } from "@/lib/slack-onboarding";
import { createUser } from "@/lib/cms/auth";
import type { Lead } from "@/lib/leads";

const fetchMock = vi.fn();
const posted = () => fetchMock.mock.calls.map(([, init]) => JSON.parse((init as RequestInit).body as string));

const lead = (kind: Lead["kind"], payload: Record<string, unknown>): Lead => ({
  kind,
  reference: "STW-TEST",
  receivedAt: "2026-11-02T10:00:00.000Z",
  payload,
});

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("SLACK_BOT_TOKEN", "xoxb-test");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("slack transport", () => {
  it("does nothing without a token", async () => {
    vi.stubEnv("SLACK_BOT_TOKEN", "");
    expect(await sendSlack("leads", { text: "hi" })).toBe(false);
    expect(await slackLead(lead("contact", { name: "A", email: "a@example.com" }))).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("routes channels, honours overrides and 'off'", () => {
    expect(slackChannelTarget("leads")).toBe("#leads");
    vi.stubEnv("SLACK_CHANNEL_LEADS", "C0123");
    expect(slackChannelTarget("leads")).toBe("C0123");
    vi.stubEnv("SLACK_CHANNEL_LEADS", "off");
    expect(slackChannelTarget("leads")).toBeNull();
    expect(slackChannelTarget("digest")).toBe("#team-ops");
    vi.stubEnv("SLACK_CHANNEL_DIGEST", "#daily");
    expect(slackChannelTarget("digest")).toBe("#daily");
  });

  it("reports Slack errors and network failures without throwing", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ ok: false, error: "not_in_channel" })));
    expect(await sendSlack("leads", { text: "hi" })).toBe(false);
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    expect(await sendSlack("leads", { text: "hi" })).toBe(false);
    error.mockRestore();
  });

  it("escapes mrkdwn control characters", () => {
    expect(esc("<!channel> & <https://x|y>")).toBe("&lt;!channel&gt; &amp; &lt;https://x|y&gt;");
  });
});

describe("slack events", () => {
  it("posts enquiries to #leads with the bot token and escaped visitor text", async () => {
    expect(
      await slackLead(lead("estimate", { name: "Priya <!here>", email: "priya@example.com", phone: "+91 98765 43210", budget: "₹1–3 lakh", message: "Need <b>app</b>" })),
    ).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://slack.com/api/chat.postMessage");
    expect((init as RequestInit).headers).toMatchObject({ authorization: "Bearer xoxb-test" });
    const [body] = posted();
    expect(body.channel).toBe("#leads");
    const json = JSON.stringify(body.blocks);
    expect(json).toContain("Priya &lt;!here&gt;");
    const mrkdwn = JSON.stringify(body.blocks.filter((block: { type: string }) => block.type !== "header"));
    expect(mrkdwn).not.toContain("<!here>");
    expect(json).toContain("wa.me/919876543210");
  });

  it("sends newsletter sign-ups to #marketing", async () => {
    await slackLead(lead("newsletter", { email: "reader@example.com" }));
    expect(posted()[0].channel).toBe("#marketing");
  });

  it("posts applications to #hiring", async () => {
    slackApplication({ id: 7, jobTitle: "Frontend Developer", name: "Ravi", email: "ravi@example.com", phone: "", links: "https://github.com/ravi", note: "" });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(posted()[0].channel).toBe("#hiring");
    expect(JSON.stringify(posted()[0].blocks)).toContain("Frontend Developer");
  });

  it("links international numbers without adding India's code", async () => {
    const { tel, whatsappUrl } = await import("@/lib/slack");
    expect(whatsappUrl("+1 415 555 0100")).toBe("https://wa.me/14155550100");
    expect(whatsappUrl("98765 43210")).toBe("https://wa.me/919876543210");
    expect(tel("+1 415 555 0100")).toContain("tel:+14155550100");
  });

  it("keeps long escaped quotes within Slack's section limit", async () => {
    await slackLead(lead("contact", { name: "A", email: "a@example.com", message: "<>".repeat(1400) }));
    const quote = posted()[0].blocks.find((block: { text?: { text: string } }) => block.text?.text.startsWith(">"));
    expect(quote.text.text.length).toBeLessThanOrEqual(3000);
  });

  it("throttles repeated alerts", async () => {
    expect(slackAlert("test:throttle", "Email failed", "Could not send")).toBe(true);
    expect(slackAlert("test:throttle", "Email failed", "Could not send")).toBe(false);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(posted()[0].channel).toBe("#site-alerts");
  });

  it("sends the daily digest once, after 9:00 IST", async () => {
    expect(await slackDigest(new Date("2026-11-03T02:00:00.000Z"))).toBe(false); // 7:30 IST
    expect(await slackDigest(new Date("2026-11-03T04:00:00.000Z"))).toBe(true); // 9:30 IST
    expect(await slackDigest(new Date("2026-11-03T05:00:00.000Z"))).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(posted()[0].channel).toBe("#team-ops");
  });
});

describe("wins and announcements", () => {
  it("celebrates won deals in #wins and new joiners in #announcements", async () => {
    slackWin({ id: 3, name: "Acme", email: "a@acme.test", service: "Website" }, "enquiry", "Satyam");
    slackWelcome({ name: "Neha", designation: "Designer" });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(posted().map((body) => body.channel).sort()).toEqual(["#announcements", "#wins"]);
  });
});

describe("slack onboarding", () => {
  it("maps permissions to channels", () => {
    expect(channelsFor({ permissions: [] })).toEqual(["team", "announcements"]);
    expect(channelsFor({ permissions: ["enquiries.view", "applications.view"] })).toEqual(["team", "announcements", "leads", "wins", "hiring"]);
  });

  it("adds a member who joined Slack to their channels once, then welcomes them", async () => {
    const user = await createUser({ email: "joiner@setuware.test", name: "New Joiner", role: "intern" });
    const calls: string[] = [];
    fetchMock.mockImplementation(async (url: string, init: RequestInit) => {
      const method = url.split("/").pop() ?? "";
      calls.push(method);
      const params = new URLSearchParams(init.body as URLSearchParams);
      const reply: Record<string, unknown> = { ok: true };
      if (method === "users.lookupByEmail") {
        if (params.get("email") !== user.email) return new Response(JSON.stringify({ ok: false, error: "users_not_found" }));
        reply.user = { id: "U1" };
      }
      if (method === "conversations.list") reply.channels = [{ id: "C1", name: "team-ops" }, { id: "C2", name: "announcements" }];
      if (method === "conversations.open") reply.channel = { id: "D1" };
      return new Response(JSON.stringify(reply));
    });
    expect(await syncSlackMembers()).toBe(1);
    expect(calls.filter((method) => method === "conversations.invite")).toHaveLength(2);
    expect(calls).toContain("chat.postMessage");
    calls.length = 0;
    expect(await syncSlackMembers()).toBe(0);
    expect(calls).not.toContain("conversations.invite");
  });
});
