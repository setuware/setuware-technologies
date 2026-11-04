import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { can, createUser, seesAll } from "@/lib/cms/auth";
import { leadCounts, listLeads, syncLeads, upsertLead } from "@/lib/cms/crm-leads";
import { resetDb } from "@/lib/cms/db";
import { allows, deleteRole, getRole, listRoles, roleInUse, saveRole } from "@/lib/cms/rbac";
import { resetZohoToken } from "@/lib/zoho-crm";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

beforeEach(() => resetDb());
afterEach(() => {
  resetDb();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("roles", () => {
  it("seeds the built-in roles", () => {
    expect(listRoles().map((role) => role.key)).toEqual(expect.arrayContaining(["owner", "sales", "sales_exec", "hr", "editor"]));
    expect(getRole("owner")?.permissions).toEqual(["*"]);
  });

  it("includes engineering roles: developers hand off tasks, tech leads see everyone's", async () => {
    expect(listRoles().map((role) => role.key)).toEqual(expect.arrayContaining(["tech_lead", "developer", "qa", "designer", "intern"]));
    const dev = await createUser({ email: "dev@example.com", name: "Dev", role: "developer", password: "DevPass12345" });
    expect(can(dev, "tasks.assign")).toBe(true);
    expect(seesAll(dev, "tasks")).toBe(false);
    expect(can(dev, "leads")).toBe(false);
    const lead = await createUser({ email: "lead@example.com", name: "Lead", role: "tech_lead", password: "LeadPass12345" });
    expect(seesAll(lead, "tasks")).toBe(true);
    expect(can(lead, "attendance")).toBe(true);
    expect(can(lead, "attendance.manage")).toBe(false);
    const intern = await createUser({ email: "in@example.com", name: "In", role: "intern", password: "InternPass1234" });
    expect(can(intern, "tasks.assign")).toBe(false);
  });

  it("checks permissions, treating a bare module as view", () => {
    expect(allows(["leads.view", "leads.edit"], "leads")).toBe(true);
    expect(allows(["leads.view"], "leads.edit")).toBe(false);
    expect(allows(["*"], "users.manage")).toBe(true);
  });

  it("saves a custom role and applies it to its users", async () => {
    const key = saveRole({ name: "Support", description: "Answers enquiries", permissions: ["enquiries.view", "enquiries.edit", "not.real"] });
    expect(getRole(key)?.permissions).toEqual(["enquiries.view", "enquiries.edit"]);
    const user = await createUser({ email: "sup@example.com", name: "Sup", role: key, password: "SupportPass123" });
    expect(can(user, "enquiries.edit")).toBe(true);
    expect(seesAll(user, "enquiries")).toBe(false);
    expect(can(user, "leads")).toBe(false);
    expect(roleInUse(key)).toBe(1);
  });

  it("never overwrites an existing role when creating one", () => {
    const key = saveRole({ name: "HR", description: "", permissions: ["jobs.view"] });
    expect(key).toBe("hr_2");
    expect(getRole("hr")?.permissions).toContain("applications.view");
  });

  it("deletes an unused custom role", () => {
    const key = saveRole({ name: "Temp", description: "", permissions: ["posts.view"] });
    deleteRole(key);
    expect(getRole(key)).toBeNull();
  });
});

describe("CRM leads", () => {
  const staff = new Map([["asha@setuware.in", "Asha"]]);

  it("mirrors Zoho leads and keeps them scoped to the owner", () => {
    upsertLead({ id: "z1", First_Name: "Ravi", Last_Name: "K", Lead_Status: "Contacted", Owner: { id: "u1", name: "Asha", email: "Asha@setuware.in" }, Modified_Time: "2026-11-02T10:00:00+05:30" }, staff);
    upsertLead({ id: "z2", Full_Name: "Meera", Lead_Status: "Junk Lead", Modified_Time: "2026-11-01T10:00:00+05:30" }, staff);
    expect(listLeads().map((lead) => lead.name)).toEqual(["Ravi K", "Meera"]);
    expect(listLeads({ assignee: "Asha" }).map((lead) => lead.zoho_id)).toEqual(["z1"]);
    expect(leadCounts()).toEqual({ open: 1, due: 0 });

    // A later sync updates the record without duplicating it.
    upsertLead({ id: "z1", First_Name: "Ravi", Last_Name: "Kumar", Lead_Status: "Pre-Qualified", Modified_Time: "2026-11-03T10:00:00+05:30" }, staff);
    const [ravi] = listLeads({ q: "Kumar" });
    expect(ravi).toMatchObject({ status: "Pre-Qualified", assignee: "Asha" });
    expect(listLeads()).toHaveLength(2);
  });

  it("syncs from Zoho and remembers the newest change", async () => {
    resetZohoToken();
    vi.stubEnv("ZOHO_CLIENT_ID", "id");
    vi.stubEnv("ZOHO_CLIENT_SECRET", "secret");
    vi.stubEnv("ZOHO_REFRESH_TOKEN", "refresh");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(json({ access_token: "tok", expires_in: 3600 }))
      .mockResolvedValueOnce(json({ data: [{ id: "z9", Full_Name: "Neha", Lead_Status: "Not Contacted", Modified_Time: "2026-11-04T09:00:00+05:30" }], info: { more_records: false } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    expect(await syncLeads()).toEqual({ synced: 1 });
    expect(listLeads()[0]).toMatchObject({ zoho_id: "z9", name: "Neha" });
    expect(await syncLeads()).toEqual({ synced: 0 });
    expect(fetchMock.mock.calls[2][1].headers["If-Modified-Since"]).toBe("2026-11-04T09:00:00+05:30");
  });

  it("reports when Zoho is not connected", async () => {
    vi.stubEnv("ZOHO_REFRESH_TOKEN", "");
    expect((await syncLeads()).error).toMatch(/not connected/);
  });
});
