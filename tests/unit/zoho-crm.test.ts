import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Lead } from "@/lib/leads";
import { resetZohoToken, sendToZoho, zohoConfigured, zohoLeadRecord } from "@/lib/zoho-crm";

const lead: Lead = {
  kind: "contact",
  reference: "STW-ZOHO01",
  receivedAt: "2026-11-03T08:00:00.000Z",
  payload: { name: "Priya Sharma", email: "priya@example.com", phone: "98765 43210", service: "Website", message: "Five pages" },
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("Zoho CRM", () => {
  beforeEach(() => {
    resetZohoToken();
    vi.stubEnv("ZOHO_CLIENT_ID", "id");
    vi.stubEnv("ZOHO_CLIENT_SECRET", "secret");
    vi.stubEnv("ZOHO_REFRESH_TOKEN", "refresh");
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("is off without credentials", () => {
    expect(zohoConfigured({})).toBe(false);
  });

  it("maps the enquiry to a Lead record", () => {
    const record = zohoLeadRecord(lead);
    expect(record).toMatchObject({
      First_Name: "Priya",
      Last_Name: "Sharma",
      Company: "Priya Sharma",
      Email: "priya@example.com",
      Phone: "98765 43210",
      Lead_Source: "Website",
    });
    expect(record.Description).toContain("Source: Contact form");
    expect(record.Description).toContain("Five pages");
  });

  it("creates a lead with a refreshed token", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ access_token: "tok", expires_in: 3600 }))
      .mockResolvedValueOnce(json({ data: [{ code: "SUCCESS", details: { id: "1" } }] }, 201));
    vi.stubGlobal("fetch", fetchMock);

    expect(await sendToZoho(lead)).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toContain("https://accounts.zoho.in/oauth/v2/token");
    expect(fetchMock.mock.calls[1][0]).toBe("https://www.zohoapis.in/crm/v7/Leads");
    expect(fetchMock.mock.calls[1][1].headers.Authorization).toBe("Zoho-oauthtoken tok");
  });

  it("adds a note to the existing lead on a duplicate", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ access_token: "tok", expires_in: 3600 }))
      .mockResolvedValueOnce(json({ data: [{ code: "DUPLICATE_DATA", details: { duplicate_record: { id: "42" } } }] }, 202))
      .mockResolvedValueOnce(json({ data: [{ code: "SUCCESS" }] }, 201));
    vi.stubGlobal("fetch", fetchMock);

    expect(await sendToZoho(lead)).toBe(true);
    expect(fetchMock.mock.calls[2][0]).toBe("https://www.zohoapis.in/crm/v7/Leads/42/Notes");
  });

  it("retries without Lead Source when the picklist value is missing", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ access_token: "tok", expires_in: 3600 }))
      .mockResolvedValueOnce(json({ data: [{ code: "INVALID_DATA", details: { api_name: "Lead_Source" } }] }, 400))
      .mockResolvedValueOnce(json({ data: [{ code: "SUCCESS", details: { id: "2" } }] }, 201));
    vi.stubGlobal("fetch", fetchMock);

    expect(await sendToZoho(lead)).toBe(true);
    const retried = JSON.parse(fetchMock.mock.calls[2][1].body as string);
    expect(retried.data[0].Lead_Source).toBeUndefined();
  });

  it("skips newsletter sign-ups and never throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect(await sendToZoho({ ...lead, kind: "newsletter" })).toBe(false);
    expect(await sendToZoho(lead)).toBe(false);
  });
});
