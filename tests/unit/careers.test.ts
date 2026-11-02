import { describe, expect, it } from "vitest";

import {
  JOB_TITLE_SUFFIX_LENGTH,
  applyHref,
  jobMetaTitle,
  jobPostingJsonLd,
  jobTeams,
  jobs,
  jobsValidThrough,
  whatWeOffer,
} from "@/lib/careers";
import { isKnownRoute } from "@/lib/routes";

const banned =
  /\b(seamless|cutting-edge|leverag\w*|robust|innovative|empower\w*|unlock\w*|elevat\w*|world-class|rockstar|ninja|fast-paced|family|synergy|journey|delve|holistic)\b/i;

describe("careers", () => {
  it("has a unique slug per role, each a known route", () => {
    const slugs = jobs.map((job) => job.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(isKnownRoute("careers", slug)).toBe(true);
    expect(isKnownRoute("careers", "not-a-role")).toBe(false);
  });

  it("keeps titles within 60 and descriptions within 155 characters", () => {
    for (const job of jobs) {
      expect(jobMetaTitle(job).length + JOB_TITLE_SUFFIX_LENGTH).toBeLessThanOrEqual(60);
      expect(job.summary.length).toBeLessThanOrEqual(155);
    }
  });

  it("gives every role complete sections and a team the filter knows", () => {
    for (const job of jobs) {
      expect(jobTeams).toContain(job.team);
      expect(job.responsibilities.length).toBeGreaterThanOrEqual(5);
      expect(job.requirements.length).toBeGreaterThanOrEqual(5);
      expect(job.niceToHaves.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("keeps banned filler words out of role copy", () => {
    expect(JSON.stringify({ jobs, whatWeOffer })).not.toMatch(banned);
  });

  it("builds a JobPosting valid for 60 days with an email application", () => {
    expect(jobsValidThrough()).toBe("2027-01-01");
    const posting = jobPostingJsonLd(jobs[0]);
    expect(posting).toMatchObject({
      "@type": "JobPosting",
      datePosted: "2026-11-02",
      validThrough: "2027-01-01",
      directApply: false,
      hiringOrganization: { name: "Setuware Technologies" },
      jobLocation: { address: { addressLocality: "Gurugram", addressRegion: "Haryana", addressCountry: "IN" } },
    });
    expect(applyHref(jobs[0])).toMatch(/^mailto:hr@setuware\.in\?subject=Application%3A%20/);
  });
});
