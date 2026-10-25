import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Indian-format currency, no decimals — quotes are never to the rupee. */
export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(value)));
}

/**
 * Compact money for headline numbers: ₹4.2L, ₹1.3Cr.
 * Lakh/crore read faster than "420,000" for an Indian audience.
 */
export function formatINRCompact(value: number): string {
  const amount = Math.max(0, Math.round(value));
  if (amount >= 10_000_000) {
    return `₹${trimZero(amount / 10_000_000)}Cr`;
  }
  if (amount >= 100_000) {
    return `₹${trimZero(amount / 100_000)}L`;
  }
  if (amount >= 1_000) {
    return `₹${trimZero(amount / 1_000)}K`;
  }
  return `₹${amount}`;
}

function trimZero(value: number): string {
  const fixed = value.toFixed(value < 10 ? 1 : 0);
  return fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
}

export function formatDate(date: string | Date): string {
  const parsed = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Short, human-quotable reference for an enquiry (e.g. STW-7F3K2A).
 * Not a security token — only for "quote your reference when you call".
 */
export function referenceId(prefix = "STW", random: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += alphabet[Math.floor(random() * alphabet.length)] ?? "0";
  }
  return `${prefix}-${suffix}`;
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

/** Stable ordering for marquee duplication without mutating the source array. */
export function duplicate<T>(items: readonly T[], times = 2): T[] {
  return Array.from({ length: times }, () => items).flat();
}
