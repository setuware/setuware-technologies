import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  addNote,
  addSubscriber,
  analytics,
  bulkStatus,
  DEFAULT_ANNOUNCEMENT,
  fillTemplate,
  followUpsDue,
  getSetting,
  listSubscribers,
  listTemplates,
  recordView,
  search,
  setFollowUp,
  setSetting,
  timeline,
  topViews,
} from "@/lib/cms/crm";
import { resetDb } from "@/lib/cms/db";
import { getEnquiry, saveEnquiry } from "@/lib/cms/store";

function enquiry(name: string, created = new Date().toISOString()) {
  saveEnquiry({
    reference: `STW-${name.toUpperCase().slice(0, 6)}`,
    kind: "contact",
    source: "Contact form",
    name,
    email: `${name.toLowerCase()}@example.com`,
    phone: "9876543210",
    service: "Website",
    message: "Need a site",
    payload: "{}",
    created_at: created,
  });
}

beforeEach(() => resetDb());
afterEach(() => resetDb());

describe("team workflow", () => {
  it("records a timeline, newest first", () => {
    enquiry("Priya");
    addNote("enquiry", 1, "note", "Satyam", "First call done");
    addNote("enquiry", 1, "status", "Satyam", "Status changed from new to contacted");
    const notes = timeline("enquiry", 1);
    expect(notes.map((note) => note.kind)).toEqual(["status", "note"]);
    expect(Object.getPrototypeOf(notes[0])).toBe(Object.prototype);
  });

  it("lists follow-ups that are due and skips closed ones", () => {
    enquiry("Due");
    enquiry("Later");
    setFollowUp(1, "2020-01-01");
    setFollowUp(2, "2999-01-01");
    expect(followUpsDue().map((item) => item.name)).toEqual(["Due"]);
    bulkStatus("enquiry", [1], "won", "Satyam");
    expect(followUpsDue()).toHaveLength(0);
    expect(getEnquiry(1)?.status).toBe("won");
  });

  it("ships default templates and fills placeholders", () => {
    expect(listTemplates("enquiry").length).toBeGreaterThanOrEqual(2);
    expect(listTemplates("application").length).toBeGreaterThanOrEqual(2);
    expect(fillTemplate("Hi {{first_name}}, re {{job}} {{unknown}}", { first_name: "Riya", job: "QA" })).toBe("Hi Riya, re QA {{unknown}}");
  });

  it("stores subscribers once, counts views and saves settings", () => {
    addSubscriber("Reader@Example.com", "footer");
    addSubscriber("reader@example.com", "blog");
    expect(listSubscribers()).toHaveLength(1);
    recordView("/blog/a");
    recordView("/blog/a");
    recordView("/blog/b");
    expect(topViews("/blog/")[0]).toEqual({ path: "/blog/a", views: 2 });
    expect(getSetting("announcement", DEFAULT_ANNOUNCEMENT).enabled).toBe(false);
    setSetting("announcement", { ...DEFAULT_ANNOUNCEMENT, enabled: true, text: "Offer" });
    expect(getSetting("announcement", DEFAULT_ANNOUNCEMENT)).toMatchObject({ enabled: true, text: "Offer" });
  });

  it("searches only the areas a role may see", () => {
    enquiry("Arjun");
    expect(search("arjun", ["enquiries"])).toHaveLength(1);
    expect(search("arjun", ["posts"])).toHaveLength(0);
    expect(search("traffic", ["posts"]).length).toBeGreaterThan(0);
  });

  it("builds 30-day analytics", () => {
    enquiry("Today");
    enquiry("Old", "2020-01-01T00:00:00.000Z");
    const data = analytics(30);
    expect(data.series).toHaveLength(30);
    expect(data.last30).toBe(1);
    expect(data.total).toBe(2);
  });
});
