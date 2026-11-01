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
 * Output (all committed to the repo):
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

  rmSync(tmpDir, { recursive: true, force: true });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nWrote ${Object.keys(manifest).filter((k) => manifest[k]).length} clip(s) to src/lib/media-manifest.json`);
  console.log("Commit public/media and src/lib/media-manifest.json, then restart `npm run dev`.");
}

main();
