import { describe, expect, it } from "vitest";

import {
  duplicate,
  formatDate,
  formatINR,
  formatINRCompact,
  pluralise,
  referenceId,
  slugify,
} from "@/lib/utils";

describe("formatINR", () => {
  it("formats whole rupees with no decimals", () => {
    expect(formatINR(250_000)).toMatch(/2,50,000/);
  });

  it("never renders a negative amount", () => {
    expect(formatINR(-100)).toMatch(/0/);
  });

  it("rounds fractional input", () => {
    expect(formatINR(1_499.6)).toMatch(/1,500/);
  });
});

describe("formatINRCompact", () => {
  it("uses lakh and crore units", () => {
    expect(formatINRCompact(420_000)).toBe("₹4.2L");
    expect(formatINRCompact(15_000_000)).toBe("₹1.5Cr");
  });

  it("uses thousands below a lakh", () => {
    expect(formatINRCompact(25_000)).toBe("₹25K");
  });

  it("drops a trailing .0", () => {
    expect(formatINRCompact(100_000)).toBe("₹1L");
  });

  it("falls back to plain rupees for small amounts", () => {
    expect(formatINRCompact(750)).toBe("₹750");
  });
});

describe("formatDate", () => {
  it("formats an ISO date without drifting across time zones", () => {
    // Asserted loosely: the exact month abbreviation ("Sep" vs "Sept") varies
    // with the ICU data bundled in the runtime.
    expect(formatDate("2026-09-18")).toMatch(/^18 Sep\w* 2026$/);
  });

  it("returns an empty string for an unparseable date", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Managed Hosting & Support")).toBe("managed-hosting-support");
  });

  it("strips diacritics", () => {
    expect(slugify("Café Münster")).toBe("cafe-munster");
  });

  it("trims leading and trailing separators", () => {
    expect(slugify("  --Hello--  ")).toBe("hello");
  });

  it("caps length", () => {
    expect(slugify("a".repeat(200)).length).toBeLessThanOrEqual(80);
  });
});

describe("referenceId", () => {
  it("uses the prefix and a six-character suffix", () => {
    expect(referenceId("STW", () => 0)).toMatch(/^STW-[A-Z0-9]{6}$/);
  });

  it("omits ambiguous characters so it can be read aloud", () => {
    const ids = Array.from({ length: 200 }, () => referenceId());
    expect(ids.join("")).not.toMatch(/[OIL01]/);
  });

  it("is deterministic given a deterministic source", () => {
    expect(referenceId("STW", () => 0.5)).toBe(referenceId("STW", () => 0.5));
  });
});

describe("pluralise", () => {
  it("handles singular, plural and irregular forms", () => {
    expect(pluralise(1, "week")).toBe("1 week");
    expect(pluralise(3, "week")).toBe("3 weeks");
    expect(pluralise(2, "person", "people")).toBe("2 people");
  });
});

describe("duplicate", () => {
  it("repeats without mutating the source", () => {
    const source = [1, 2];
    expect(duplicate(source)).toEqual([1, 2, 1, 2]);
    expect(source).toEqual([1, 2]);
  });
});
