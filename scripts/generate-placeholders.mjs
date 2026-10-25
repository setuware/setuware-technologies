#!/usr/bin/env node
/**
 * Generates the placeholder images the design calls for.
 *
 * These are deliberately abstract rather than fake photography: a gradient
 * field with a subtle grid and the slot's name, so it is obvious at a glance
 * which image is still missing and what belongs there. They are SVG, so each
 * one is under 2KB regardless of its dimensions.
 *
 * Run: npm run images:placeholders
 * Replace: drop a real photo at the same path in `public/images/`.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const OUT_DIR = join(process.cwd(), "public", "images");

/** One entry per slot in `src/lib/images.ts`. */
const SLOTS = [
  { file: "hero-team.svg", w: 1920, h: 1080, label: "Hero — team at work", from: "#0b1220", to: "#15314f", quiet: true },
  { file: "about-office.svg", w: 1080, h: 1200, label: "About — studio", from: "#1e3a8a", to: "#0e7490" },
  { file: "service-web.svg", w: 1200, h: 800, label: "Service — web app", from: "#1d4ed8", to: "#38bdf8" },
  { file: "service-cloud.svg", w: 900, h: 700, label: "Service — cloud", from: "#0ea5e9", to: "#e0f2fe" },
  { file: "case-tera.svg", w: 1000, h: 800, label: "Case study — Tera", from: "#1e3a8a", to: "#7c3aed" },
  { file: "project-medicare.svg", w: 900, h: 1000, label: "Project — MediCare app", from: "#0f172a", to: "#2563eb" },
  { file: "skills-gap.svg", w: 1400, h: 900, label: "Skills gap — portrait", from: "#134e4a", to: "#1e3a8a" },
  { file: "article-automation.svg", w: 1200, h: 800, label: "Article — automation", from: "#0c4a6e", to: "#0284c7" },
  { file: "article-processes.svg", w: 900, h: 700, label: "Article — processes", from: "#1e293b", to: "#475569" },
  { file: "article-growth.svg", w: 900, h: 700, label: "Article — growth", from: "#1e40af", to: "#06b6d4" },
];

function svg({ w, h, label, from, to, quiet = false }) {
  const unit = Math.max(w, h) / 36;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label} placeholder">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <pattern id="p" width="${unit}" height="${unit}" patternUnits="userSpaceOnUse">
      <path d="M ${unit} 0 L 0 0 0 ${unit}" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#p)"/>
  <circle cx="${w * 0.78}" cy="${h * 0.24}" r="${Math.min(w, h) * 0.26}" fill="rgba(255,255,255,0.07)"/>
  <circle cx="${w * 0.2}" cy="${h * 0.8}" r="${Math.min(w, h) * 0.18}" fill="rgba(255,255,255,0.05)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="${Math.max(16, Math.min(w, h) * 0.055)}" font-weight="600"
        fill="rgba(255,255,255,${quiet ? 0.2 : 0.72})">${label}</text>
  <text x="50%" y="${h / 2 + Math.min(w, h) * 0.075}" text-anchor="middle" dominant-baseline="middle"
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
        font-size="${Math.max(11, Math.min(w, h) * 0.03)}"
        fill="rgba(255,255,255,${quiet ? 0.14 : 0.45})">${w} × ${h} · replace in public/images</text>
</svg>
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const slot of SLOTS) {
    const path = join(OUT_DIR, slot.file);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, svg(slot), "utf8");
    process.stdout.write(`  ✓ ${slot.file.padEnd(26)} ${slot.w}×${slot.h}\n`);
  }

  process.stdout.write(`\n${SLOTS.length} placeholders written to public/images\n`);
}

void main();
