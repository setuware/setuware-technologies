#!/usr/bin/env node
/**
 * Download and web-encode the homepage background videos.
 *
 *   npm run media:fetch
 *
 * Clips come from Pexels (https://www.pexels.com/license/): free for
 * commercial use, no attribution required. Swap the ids below for any other
 * Pexels video id to change footage.
 *
 * Requires ffmpeg on PATH (macOS: `brew install ffmpeg`).
 *
 * Photos (also Pexels) are cropped to each image slot's exact size from
 * src/lib/images.ts, so swapping them in never shifts the layout.
 *
 * Output (all committed to the repo):
 *   public/images/photos/<slot>.jpg  cropped, compressed photos
 *   public/media/<name>.mp4   H.264, 1920 wide, no audio, faststart
 *   public/media/<name>.webm  VP9, smaller where supported
 *   public/media/<name>.jpg   poster frame (first paint / reduced motion)
 *   src/lib/media-manifest.json  tells the site which files exist
 */

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "media");
const tmpDir = join(root, ".media-tmp");
const manifestPath = join(root, "src", "lib", "media-manifest.json");

/**
 * name      → file stem in public/media
 * pexelsId  → https://www.pexels.com/video/<slug>-<id>/
 * seconds   → loop length kept from the start of the clip
 */
const CLIPS = [
  {
    // fauxels — "A Group Of People Busy Working With Their Computers"
    name: "hero-bg",
    pexelsId: 3249672,
    start: 0,
    seconds: 14,
    // Background loop: darker and softer so the headline stays readable.
    filter: "eq=brightness=-0.06:saturation=0.85",
  },
  {
    // "A Group of People Looking at a Laptop in an Office"
    name: "skills-gap",
    pexelsId: 8519377,
    start: 0,
    seconds: 20,
    filter: "null",
  },
];

/**
 * Image slot (src/lib/images.ts key) → Pexels photo id and target size.
 * Page: https://www.pexels.com/photo/<id>/
 */
const PHOTOS = [
  { key: "heroBackdrop", id: 12899191, w: 1920, h: 1080 }, // software development discussion in office
  { key: "aboutOffice", id: 7212929, w: 1080, h: 1200 }, // young team collaborating
  { key: "serviceWeb", id: 69432, w: 1200, h: 800 }, // laptop and phone on a desk
  { key: "serviceCloud", id: 5480781, w: 900, h: 700 }, // server racks in a data centre
  { key: "caseStudyFeature", id: 7947996, w: 1000, h: 800 }, // charts on a laptop
  { key: "projectMedicare", id: 3850268, w: 900, h: 1000 }, // using an app on a smartphone
  { key: "skillsGap", id: 7876755, w: 1400, h: 900 }, // team around a laptop
  { key: "articleAutomation", id: 6804068, w: 1200, h: 800 }, // people working at computers
  { key: "articleProcesses", id: 196644, w: 900, h: 700 }, // wireframe sketches beside a phone
  { key: "articleGrowth", id: 39190577, w: 900, h: 700 }, // team reviewing growth charts
];

async function downloadPhoto(id, dest) {
  const urls = [
    `https://www.pexels.com/photo/${id}/download/`,
    `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=2800`,
  ];
  let lastError;
  for (const url of urls) {
    try {
      const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0 (setuware media fetch)" } });
      const type = res.headers.get("content-type") ?? "";
      if (res.ok && type.startsWith("image/")) {
        writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
        return;
      }
      lastError = new Error(`HTTP ${res.status} ${type}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("download failed");
}

function slugify(key) {
  return key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: ["ignore", "ignore", "inherit"] });
}

function hasFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

async function download(id, dest) {
  const url = `https://www.pexels.com/download/video/${id}/`;
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0 (setuware media fetch)" },
  });
  if (!res.ok) throw new Error(`Pexels ${id}: HTTP ${res.status}`);
  const type = res.headers.get("content-type") ?? "";
  if (!type.startsWith("video/")) throw new Error(`Pexels ${id}: got ${type || "no content-type"}, not a video`);
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  if (!hasFfmpeg()) {
    console.error("ffmpeg not found. Install it first (macOS: brew install ffmpeg).");
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });
  mkdirSync(tmpDir, { recursive: true });

  const manifest = {};
  for (const clip of CLIPS) {
    const raw = join(tmpDir, `${clip.name}-source.mp4`);
    const base = join(outDir, clip.name);
    const trim = ["-ss", String(clip.start), "-t", String(clip.seconds)];
    const vf = `scale=1920:-2:flags=lanczos,${clip.filter},fps=25`;
    try {
      process.stdout.write(`↓ ${clip.name} (pexels ${clip.pexelsId}) … `);
      await download(clip.pexelsId, raw);

      process.stdout.write("mp4 … ");
      run("ffmpeg", ["-y", ...trim, "-i", raw, "-an", "-vf", vf, "-c:v", "libx264", "-preset", "slow",
        "-crf", "26", "-pix_fmt", "yuv420p", "-movflags", "+faststart", `${base}.mp4`]);

      process.stdout.write("webm … ");
      run("ffmpeg", ["-y", ...trim, "-i", raw, "-an", "-vf", vf, "-c:v", "libvpx-vp9", "-b:v", "0",
        "-crf", "38", "-row-mt", "1", `${base}.webm`]);

      process.stdout.write("poster … ");
      run("ffmpeg", ["-y", "-ss", String(clip.start + 0.5), "-i", raw, "-frames:v", "1",
        "-vf", `scale=1920:-2,${clip.filter}`, "-q:v", "4", `${base}.jpg`]);

      manifest[clip.name] = {
        mp4: `/media/${clip.name}.mp4`,
        webm: `/media/${clip.name}.webm`,
        poster: `/media/${clip.name}.jpg`,
        source: `https://www.pexels.com/video/${clip.pexelsId}/`,
      };
      console.log("done");
    } catch (error) {
      console.log("FAILED");
      console.error(`  ${error instanceof Error ? error.message : error}`);
      if (existsSync(`${base}.mp4`)) manifest[clip.name] = undefined;
    }
  }

  const photoDir = join(root, "public", "images", "photos");
  mkdirSync(photoDir, { recursive: true });
  manifest.images = {};
  for (const photo of PHOTOS) {
    const raw = join(tmpDir, `${photo.key}-source`);
    const file = `${slugify(photo.key)}.jpg`;
    try {
      process.stdout.write(`↓ ${photo.key} (pexels photo ${photo.id}) … `);
      await downloadPhoto(photo.id, raw);
      // Fill the slot (cover), centre-crop, then encode at web quality.
      run("ffmpeg", ["-y", "-i", raw, "-vf",
        `scale=${photo.w}:${photo.h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${photo.w}:${photo.h}`,
        "-q:v", "4", join(photoDir, file)]);
      manifest.images[photo.key] = `/images/photos/${file}`;
      console.log("done");
    } catch (error) {
      console.log("FAILED");
      console.error(`  ${error instanceof Error ? error.message : error}`);
    }
  }

  rmSync(tmpDir, { recursive: true, force: true });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const clipCount = CLIPS.filter((c) => manifest[c.name]).length;
  const photoCount = Object.keys(manifest.images).length;
  console.log(`\n${clipCount}/${CLIPS.length} videos and ${photoCount}/${PHOTOS.length} photos written; see src/lib/media-manifest.json`);
  console.log("Commit public/media, public/images/photos and src/lib/media-manifest.json, then restart `npm run dev`.");
}

main();
