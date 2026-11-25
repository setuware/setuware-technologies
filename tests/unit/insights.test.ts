import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { addSubscriber, setAssignee, setFollowUp, setStatus } from "@/lib/cms/crm";
import { getDb, resetDb } from "@/lib/cms/db";
import { attention, enquiryFunnel, parseRange, percentChange, periodMetrics } from "@/lib/cms/insights";
import { listEnquiries, saveEnquiry } from "@/lib/cms/store";

const NOW = new Date("2026-11-24T12:00:00.000Z");
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 86_400_000).toISOString();

function enquiry(name: string, created: string) {
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
  return listEnquiries().find((item) => item.name === name)!.id;
}

function views(day: string, n: number) {
  getDb().prepare("INSERT INTO page_views_daily (day,path,views) VALUES (?,?,?)").run(day, "/", n);
}

beforeEach(() => resetDb());
afterEach(() => resetDb());

describe("insights", () => {
  it("parses only the supported ranges", () => {
    expect(parseRange("7")).toBe(7);
    expect(parseRange("90")).toBe(90);
    expect(parseRange("13")).toBe(30);
    expect(parseRange(undefined)).toBe(30);
  });

  it("computes percentage change, with null when there is no earlier data", () => {
    expect(percentChange(15, 10)).toBe(50);
    expect(percentChange(5, 10)).toBe(-50);
    expect(percentChange(0, 0)).toBe(0);
    expect(percentChange(3, 0)).toBeNull();
  });

  it("compares the period with the one before and ignores spam", () => {
    enquiry("Asha", daysAgo(1));
    enquiry("Bala", daysAgo(3));
    const spam = enquiry("Spammy", daysAgo(2));
    setStatus("enquiry", spam, "spam");
    enquiry("Chitra", daysAgo(10));
    const won = enquiry("Dev", daysAgo(2));
    setStatus("enquiry", won, "won");
    views(daysAgo(0).slice(0, 10), 40);
    views(daysAgo(8).slice(0, 10), 20);
    addSubscriber("reader@example.com", "blog");

    const metrics = periodMetrics(7, NOW);
    expect(metrics.labels).toHaveLength(7);
    expect(metrics.labels.at(-1)).toBe("2026-11-24");
    expect(metrics.enquiries.current).toBe(3);
    expect(metrics.enquiries.previous).toBe(1);
    expect(metrics.enquiries.change).toBe(200);
    expect(metrics.won.current).toBe(1);
    expect(metrics.visits).toMatchObject({ current: 40, previous: 20, change: 100 });
    expect(metrics.visits.series.at(-1)).toBe(40);
  });

  it("builds the funnel from enquiries in the period", () => {
    views(daysAgo(1).slice(0, 10), 100);
    const a = enquiry("Asha", daysAgo(1));
    const b = enquiry("Bala", daysAgo(2));
    enquiry("Chitra", daysAgo(3));
    enquiry("Old", daysAgo(40));
    setStatus("enquiry", a, "won");
    setStatus("enquiry", b, "qualified");

    const steps = enquiryFunnel(30, NOW);
    expect(steps.map((step) => [step.label, step.n])).toEqual([
      ["Visits", 100],
      ["Enquiries", 3],
      ["Qualified", 2],
      ["Proposal", 1],
      ["Won", 1],
    ]);
    expect(steps[1].rate).toBe(3);
    expect(steps[2].rate).toBe(67);
  });

  it("counts slipping work, scoped to one owner when asked", () => {
    const stale = enquiry("Asha", daysAgo(2));
    enquiry("Fresh", new Date(NOW.getTime() - 3_600_000).toISOString());
    const followUp = enquiry("Bala", daysAgo(5));
    setStatus("enquiry", followUp, "contacted");
    setFollowUp(followUp, "2026-11-20");
    setAssignee("enquiry", stale, "Riya");

    const all = attention({}, NOW);
    expect(all.unanswered).toBe(1);
    expect(all.overdueFollowUps).toBe(1);
    expect(all.unassignedEnquiries).toBe(2);

    const riya = attention({ enquiries: "Riya" }, NOW);
    expect(riya.unanswered).toBe(1);
    expect(riya.overdueFollowUps).toBe(0);
    expect(riya.unassignedEnquiries).toBe(0);
  });
});
