#!/usr/bin/env node
/**
 * Render the homepage background loops from code — no stock footage.
 *
 *   npm run media:render              # every scene
 *   npm run media:render -- hero-bg   # just one
 *   npm run media:render -- --stills /tmp/look   # a few PNGs, no encode
 *
 * Each scene is a <canvas> animation drawn by `scene()` below. Playwright
 * opens it in headless Chromium, steps it frame by frame through
 * `renderFrame(t)`, and screenshots each frame; ffmpeg then encodes the
 * frames. Every moving part is a function of sin/cos(2π·k·t/duration) with an
 * integer k (or a fractional phase that wraps a whole number of times), so
 * frame N would equal frame 0 and the video loops without a seam.
 *
 * Requires ffmpeg on PATH and Playwright's Chromium
 * (`npx playwright install chromium`).
 *
 * Output (all committed to the repo):
 *   public/media/<name>.mp4   H.264, 1920×1080, 25 fps, no audio, faststart
 *   public/media/<name>.webm  VP9, smaller where supported
 *   public/media/<name>.jpg   poster (first frame)
 *   src/lib/media-manifest.json  entries for each rendered scene
 */

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "media");
const manifestPath = join(root, "src", "lib", "media-manifest.json");

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 25;

const SCENES = [
  { name: "hero-bg", seconds: 14 },
  { name: "skills-gap", seconds: 16 },
];

/* -------------------------------------------------------------------------- */
/* Scene code — serialised and run inside the browser page                     */
/* -------------------------------------------------------------------------- */

/**
 * Installs `window.renderFrame(t)` for the named scene. Runs in the browser:
 * it must be self-contained (no closures over Node values).
 */
function scene(name, W, H, T) {
  const TAU = Math.PI * 2;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  /* ---- helpers ----------------------------------------------------------- */

  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smoothstep = (a, b, x) => {
    const k = clamp((x - a) / (b - a), 0, 1);
    return k * k * (3 - 2 * k);
  };
  const ease = (x) => x * x * x * (x * (x * 6 - 15) + 10); // smootherstep
  const frac = (x) => x - Math.floor(x);
  const lerp = (a, b, k) => a + (b - a) * k;

  function glowSprite(radius, rgb) {
    const c = document.createElement("canvas");
    c.width = c.height = radius * 2;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(radius, radius, 0, radius, radius, radius);
    gr.addColorStop(0, `rgba(${rgb},1)`);
    gr.addColorStop(0.12, `rgba(${rgb},0.6)`);
    gr.addColorStop(0.35, `rgba(${rgb},0.16)`);
    gr.addColorStop(0.7, `rgba(${rgb},0.03)`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr;
    g.fillRect(0, 0, radius * 2, radius * 2);
    return c;
  }
  function drawSprite(sprite, x, y, size, alpha) {
    if (alpha <= 0.002) return;
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    ctx.globalAlpha = 1;
  }

  // Aurora is painted at quarter resolution and scaled up: free blur, and
  // far fewer pixels to fill per frame.
  const aur = document.createElement("canvas");
  aur.width = W / 4;
  aur.height = H / 4;
  const actx = aur.getContext("2d");
  function drawAurora(blobs, p, intensity) {
    actx.globalCompositeOperation = "source-over";
    actx.clearRect(0, 0, aur.width, aur.height);
    actx.globalCompositeOperation = "lighter";
    const sx = aur.width / W;
    for (const b of blobs) {
      const x = (b.x + b.ax * Math.sin(TAU * b.fx * p + b.px)) * W * sx;
      const y = (b.y + b.ay * Math.cos(TAU * b.fy * p + b.py)) * H * sx;
      const r = b.r * W * sx * (1 + 0.08 * Math.sin(TAU * p + b.px));
      const rot = b.rot + 0.18 * Math.sin(TAU * p + b.py);
      const a = b.a * intensity * (0.8 + 0.2 * Math.sin(TAU * b.fa * p + b.px));
      actx.save();
      actx.translate(x, y);
      actx.rotate(rot);
      actx.scale(1, b.squash);
      const g = actx.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, `rgba(${b.rgb},${a})`);
      g.addColorStop(0.45, `rgba(${b.rgb},${a * 0.45})`);
      g.addColorStop(1, `rgba(${b.rgb},0)`);
      actx.fillStyle = g;
      actx.fillRect(-r, -r, r * 2, r * 2);
      actx.restore();
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(aur, 0, 0, W, H);
    ctx.restore();
  }

  /** Floor grid in perspective, scrolling toward the viewer. */
  function drawGrid(p, opt) {
    const { vx, horizon, alpha, rgb, cycles, fadeLeft } = opt;
    const rows = 16;
    const camH = H - horizon;
    ctx.save();
    ctx.lineWidth = 1;
    // Receding rows: depth z in (0, rows], scroll wraps a whole row per cycle.
    const scroll = frac(p * cycles);
    for (let i = 0; i < rows; i++) {
      const z = rows - i - scroll; // far → near
      const y = horizon + camH / (z * 0.55 + 0.45);
      if (y > H + 2) continue;
      const near = smoothstep(horizon, H, y);
      const a = alpha * Math.pow(near, 1.4);
      const g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, `rgba(${rgb},0)`);
      g.addColorStop(fadeLeft, `rgba(${rgb},${a * 0.25})`);
      g.addColorStop(Math.min(0.99, fadeLeft + 0.25), `rgba(${rgb},${a})`);
      g.addColorStop(1, `rgba(${rgb},${a * 0.6})`);
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    // Rays from the vanishing point.
    const rays = 34;
    for (let i = 0; i <= rays; i++) {
      const bx = vx + (i - rays / 2) * (W * 2.6) / rays;
      const g = ctx.createLinearGradient(vx, horizon, bx, H);
      const xf = clamp(bx / W, 0, 1);
      const side = smoothstep(fadeLeft * 0.6, fadeLeft + 0.25, xf);
      g.addColorStop(0, `rgba(${rgb},0)`);
      g.addColorStop(0.35, `rgba(${rgb},${alpha * 0.35 * side})`);
      g.addColorStop(1, `rgba(${rgb},${alpha * side})`);
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(vx, horizon);
      ctx.lineTo(bx, H);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawPolylineStreak(pts, q, alpha, rgb, width) {
    // Head at q along the polyline, tail trailing 22% of its length.
    const lens = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const l = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      lens.push(l);
      total += l;
    }
    const at = (d) => {
      let acc = 0;
      for (let i = 0; i < lens.length; i++) {
        if (d <= acc + lens[i] || i === lens.length - 1) {
          const k = clamp((d - acc) / lens[i], 0, 1);
          return {
            x: lerp(pts[i].x, pts[i + 1].x, k),
            y: lerp(pts[i].y, pts[i + 1].y, k),
          };
        }
        acc += lens[i];
      }
      return pts[pts.length - 1];
    };
    const head = q * total;
    const tail = Math.max(0, head - total * 0.22);
    const steps = 14;
    ctx.save();
    ctx.lineCap = "round";
    ctx.globalCompositeOperation = "lighter";
    let prev = at(tail);
    for (let s = 1; s <= steps; s++) {
      const d = lerp(tail, head, s / steps);
      const cur = at(d);
      const k = s / steps;
      ctx.strokeStyle = `rgba(${rgb},${alpha * k * k})`;
      ctx.lineWidth = width * (0.4 + 0.6 * k);
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
      prev = cur;
    }
    ctx.restore();
    return at(head);
  }

  /* ---- hero-bg ----------------------------------------------------------- */

  function heroScene() {
    const rand = rng(20240611);
    const glowCyan = glowSprite(64, "0,161,198");
    const glowWhite = glowSprite(32, "200,240,255");
    const glowBlue = glowSprite(64, "0,97,168");

    const blobs = [
      { x: 0.8, y: 0.28, r: 0.42, rgb: "0,161,198", a: 0.34, squash: 0.5, rot: -0.35 },
      { x: 0.64, y: 0.78, r: 0.48, rgb: "0,97,168", a: 0.42, squash: 0.55, rot: 0.25 },
      { x: 1.0, y: 0.7, r: 0.38, rgb: "0,120,200", a: 0.3, squash: 0.7, rot: -0.6 },
      { x: 0.5, y: 0.02, r: 0.4, rgb: "0,140,190", a: 0.14, squash: 0.35, rot: 0.1 },
      { x: 0.12, y: 0.95, r: 0.35, rgb: "0,70,140", a: 0.12, squash: 0.5, rot: 0.2 },
    ].map((b, i) => ({
      ...b,
      ax: 0.05 + 0.03 * (i % 2),
      ay: 0.05,
      fx: 1,
      fy: 1,
      fa: 2,
      px: i * 1.7,
      py: i * 2.3,
    }));

    const nodes = [];
    for (let i = 0; i < 62; i++) {
      // Biased right: the headline sits on the left 45%.
      const u = rand();
      const x = 0.2 + 0.88 * Math.pow(u, 0.7);
      const z = 0.35 + 0.65 * rand();
      nodes.push({
        x: x * W,
        y: (-0.04 + 1.08 * rand()) * H,
        z,
        ax: (14 + 34 * rand()) * z,
        ay: (10 + 26 * rand()) * z,
        kx: 1,
        ky: rand() < 0.3 ? 2 : 1,
        px: rand() * TAU,
        py: rand() * TAU,
        tw: rand() * TAU,
        tk: 1 + Math.floor(rand() * 3),
        hub: false,
      });
    }
    // A few hub nodes that read as the brighter points of the network.
    [5, 17, 29, 41].forEach((i) => {
      nodes[i].hub = true;
      nodes[i].z = 1;
    });

    const pos = (n, p) => ({
      x: n.x + n.ax * Math.sin(TAU * n.kx * p + n.px),
      y: n.y + n.ay * Math.cos(TAU * n.ky * p + n.py),
    });

    // Streak paths: short walks over near neighbours (at rest positions).
    const near = (i) =>
      nodes
        .map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
        .filter((e) => e.j !== i && e.d < 260)
        .sort((a, b) => a.d - b.d)
        .map((e) => e.j);
    const paths = [];
    const starts = [3, 11, 19, 27, 35, 44, 50, 8];
    for (const s of starts) {
      const path = [s];
      let cur = s;
      for (let step = 0; step < 3; step++) {
        const options = near(cur).filter((j) => !path.includes(j));
        if (!options.length) break;
        cur = options[Math.floor(rand() * Math.min(3, options.length))];
        path.push(cur);
      }
      if (path.length >= 2) {
        paths.push({ path, m: 1 + (paths.length % 2), off: rand(), w: 0 });
      }
    }
    // Each streak runs ~1.6 s, then rests until its next pass.
    for (const pa of paths) pa.w = (1.6 / T) * pa.m;

    const mask = (x) => 0.18 + 0.82 * smoothstep(0.3 * W, 0.62 * W, x);

    return (t) => {
      const p = t / T;
      ctx.globalCompositeOperation = "source-over";
      const base = ctx.createLinearGradient(0, 0, W, H);
      base.addColorStop(0, "#05070d");
      base.addColorStop(1, "#0b1020");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, W, H);

      drawAurora(blobs, p, 1);
      drawGrid(p, {
        vx: W * 0.68,
        horizon: H * 0.6,
        alpha: 0.085,
        rgb: "120,190,230",
        cycles: 2,
        fadeLeft: 0.38,
      });

      const P = nodes.map((n) => pos(n, p));

      // Links.
      ctx.save();
      ctx.lineWidth = 1;
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
          const max = 290 * (0.6 + 0.4 * Math.min(nodes[i].z, nodes[j].z));
          if (d > max) continue;
          const k = 1 - d / max;
          const zf = (nodes[i].z + nodes[j].z) / 2;
          const a = k * k * 0.42 * zf * mask((P[i].x + P[j].x) / 2);
          ctx.strokeStyle = `rgba(110,200,235,${a})`;
          ctx.beginPath();
          ctx.moveTo(P[i].x, P[i].y);
          ctx.lineTo(P[j].x, P[j].y);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Light streaks travelling along the links.
      for (const pa of paths) {
        const u = frac(pa.m * p + pa.off);
        if (u > pa.w) continue;
        const q = u / pa.w;
        const fade = Math.sin(Math.PI * q);
        const pts = pa.path.map((i) => P[i]);
        const head = drawPolylineStreak(pts, ease(q), 0.75 * fade * mask(pts[0].x), "150,230,255", 2);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        drawSprite(glowWhite, head.x, head.y, 34, 0.9 * fade * mask(head.x));
        ctx.restore();
      }

      // Nodes.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const { x, y } = P[i];
        const tw = 0.7 + 0.3 * Math.sin(TAU * n.tk * p + n.tw);
        const m = mask(x);
        const size = (n.hub ? 120 : 46) * n.z;
        drawSprite(i % 3 === 0 ? glowBlue : glowCyan, x, y, size, (n.hub ? 0.85 : 0.6) * n.z * tw * m);
        drawSprite(glowWhite, x, y, (n.hub ? 22 : 12) * n.z, 0.95 * tw * m);
        if (n.hub) {
          // Slow pulse ring, two per loop.
          const r = frac(2 * p + n.tw / TAU);
          ctx.strokeStyle = `rgba(120,215,240,${0.22 * (1 - r) * m})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x, y, 8 + r * 70, 0, TAU);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Keep the copy side calm and dark, plus a soft vignette.
      ctx.globalCompositeOperation = "source-over";
      const left = ctx.createLinearGradient(0, 0, W * 0.6, 0);
      left.addColorStop(0, "rgba(5,7,13,0.78)");
      left.addColorStop(0.5, "rgba(5,7,13,0.45)");
      left.addColorStop(1, "rgba(5,7,13,0)");
      ctx.fillStyle = left;
      ctx.fillRect(0, 0, W, H);
      const vig = ctx.createRadialGradient(W * 0.6, H * 0.5, H * 0.35, W * 0.6, H * 0.5, W * 0.8);
      vig.addColorStop(0, "rgba(3,5,10,0)");
      vig.addColorStop(1, "rgba(3,5,10,0.55)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    };
  }

  /* ---- skills-gap -------------------------------------------------------- */

  function skillsScene() {
    const rand = rng(7311);
    const glowTeal = glowSprite(64, "20,200,190");
    const glowCyan = glowSprite(64, "0,161,198");
    const glowWhite = glowSprite(32, "215,250,255");
    const halo = glowSprite(128, "0,180,200");

    const blobs = [
      { x: 0.5, y: 0.5, r: 0.36, rgb: "0,170,190", a: 0.34, squash: 0.62, rot: 0.1 },
      { x: 0.3, y: 0.35, r: 0.36, rgb: "0,97,168", a: 0.38, squash: 0.55, rot: -0.4 },
      { x: 0.72, y: 0.7, r: 0.38, rgb: "20,160,170", a: 0.32, squash: 0.55, rot: 0.5 },
      { x: 0.85, y: 0.2, r: 0.3, rgb: "0,110,190", a: 0.24, squash: 0.6, rot: -0.2 },
      { x: 0.12, y: 0.82, r: 0.3, rgb: "0,120,170", a: 0.2, squash: 0.6, rot: 0.3 },
    ].map((b, i) => ({
      ...b,
      ax: 0.06,
      ay: 0.05,
      fx: 1,
      fy: 1,
      fa: 2,
      px: i * 1.3,
      py: i * 2.1,
    }));

    const N = 34;
    const cx = W / 2;
    const cy = H / 2;
    // Team layouts the cluster cycles through; the last flows back into the first.
    const groupCounts = [4, 3, 5, 4];
    const layouts = groupCounts.map((count, li) => {
      const order = Array.from({ length: N }, (_, i) => i);
      for (let i = N - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      const rot = li * 0.9 + rand();
      const R = count === 3 ? 230 : count === 4 ? 270 : 300;
      const centres = Array.from({ length: count }, (_, g) => {
        const a = rot + (g / count) * TAU;
        return { x: cx + Math.cos(a) * R * 1.25, y: cy + Math.sin(a) * R * 0.78 };
      });
      const group = new Array(N);
      const slot = new Array(N);
      const sizes = new Array(count).fill(0);
      order.forEach((nodeIdx, k) => {
        const g = k % count;
        group[nodeIdx] = g;
        slot[nodeIdx] = sizes[g]++;
      });
      const target = new Array(N);
      for (let i = 0; i < N; i++) {
        const g = group[i];
        const s = slot[i];
        const size = sizes[g];
        // Sunflower packing inside each team.
        const r = 26 + 74 * Math.sqrt((s + 0.5) / size);
        const a = s * 2.39996 + rot * 2;
        target[i] = {
          x: centres[g].x + Math.cos(a) * r * (s === 0 ? 0 : 1),
          y: centres[g].y + Math.sin(a) * r * (s === 0 ? 0 : 1),
        };
      }
      return { count, group, target, centres };
    });
    const L = layouts.length;

    const wob = Array.from({ length: N }, () => ({
      ax: 6 + 10 * rand(),
      ay: 6 + 10 * rand(),
      px: rand() * TAU,
      py: rand() * TAU,
      k: 1 + Math.floor(rand() * 2),
      z: 0.65 + 0.35 * rand(),
      tw: rand() * TAU,
    }));

    const dust = Array.from({ length: 70 }, () => ({
      x: rand() * W,
      y: rand() * H,
      ax: 20 + 40 * rand(),
      ay: 15 + 30 * rand(),
      px: rand() * TAU,
      a: 0.15 + 0.3 * rand(),
      s: 6 + 10 * rand(),
    }));

    // Timeline: each layout holds, then morphs into the next.
    const state = (p) => {
      const seg = p * L;
      const li = Math.floor(seg) % L;
      const local = seg - Math.floor(seg);
      const e = ease(smoothstep(0.55, 1, local));
      return { a: layouts[li], b: layouts[(li + 1) % L], e, local };
    };

    return (t) => {
      const p = t / T;
      const { a, b, e, local } = state(p);
      ctx.globalCompositeOperation = "source-over";
      const base = ctx.createLinearGradient(0, 0, W, H);
      base.addColorStop(0, "#07101d");
      base.addColorStop(1, "#0d1b2e");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, W, H);

      drawAurora(blobs, p, 1.1);
      drawGrid(p, {
        vx: W * 0.5,
        horizon: H * 0.64,
        alpha: 0.06,
        rgb: "120,210,225",
        cycles: 2,
        fadeLeft: 0.0001,
      });

      // Dust.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const d of dust) {
        const x = d.x + d.ax * Math.sin(TAU * p + d.px);
        const y = d.y + d.ay * Math.cos(TAU * p + d.px * 1.3);
        drawSprite(glowCyan, x, y, d.s, d.a * (0.7 + 0.3 * Math.sin(TAU * 2 * p + d.px)));
      }
      ctx.restore();

      const P = [];
      for (let i = 0; i < N; i++) {
        const w = wob[i];
        const ta = a.target[i];
        const tb = b.target[i];
        // Curve the morph a little so nodes swing rather than slide.
        const bend = Math.sin(Math.PI * e) * 40 * (i % 2 ? 1 : -1);
        const dx = tb.x - ta.x;
        const dy = tb.y - ta.y;
        const len = Math.hypot(dx, dy) || 1;
        P.push({
          x: lerp(ta.x, tb.x, e) + (-dy / len) * bend + w.ax * Math.sin(TAU * w.k * p + w.px),
          y: lerp(ta.y, tb.y, e) + (dx / len) * bend + w.ay * Math.cos(TAU * w.k * p + w.py),
        });
      }

      // Team halos, centred on the members' live positions.
      const settle = 1 - Math.sin(Math.PI * e);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (const [layout, weight] of [[a, 1 - e], [b, e]]) {
        if (weight < 0.01) continue;
        for (let g = 0; g < layout.count; g++) {
          let sx = 0;
          let sy = 0;
          let c = 0;
          for (let i = 0; i < N; i++) {
            if (layout.group[i] !== g) continue;
            sx += P[i].x;
            sy += P[i].y;
            c++;
          }
          const hx = sx / c;
          const hy = sy / c;
          const breathe = 0.9 + 0.1 * Math.sin(TAU * 4 * p + g);
          drawSprite(halo, hx, hy, 380 * breathe, 0.34 * weight * settle);
          ctx.strokeStyle = `rgba(110,230,225,${0.16 * weight * settle})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(hx, hy, 118 + 6 * Math.sin(TAU * 4 * p + g), 0, TAU);
          ctx.stroke();
        }
      }
      ctx.restore();

      // Links: strong inside a team, faint while regrouping.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = 1.1;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const same = (a.group[i] === a.group[j] ? 1 - e : 0) + (b.group[i] === b.group[j] ? e : 0);
          const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
          const near = Math.max(0, 1 - d / 220);
          const al = (same * 0.55 + 0.12) * near * near;
          if (al < 0.01) continue;
          ctx.strokeStyle = `rgba(120,225,230,${al})`;
          ctx.beginPath();
          ctx.moveTo(P[i].x, P[i].y);
          ctx.lineTo(P[j].x, P[j].y);
          ctx.stroke();
        }
      }
      ctx.restore();

      // While a team holds, pulses run between neighbouring team centres.
      if (local < 0.5) {
        const q = local / 0.5;
        const fade = Math.sin(Math.PI * q);
        for (let g = 0; g < a.count; g++) {
          const c0 = a.centres[g];
          const c1 = a.centres[(g + 1) % a.count];
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = `rgba(110,200,230,${0.08 * fade})`;
          ctx.setLineDash([3, 9]);
          ctx.beginPath();
          ctx.moveTo(c0.x, c0.y);
          ctx.lineTo(c1.x, c1.y);
          ctx.stroke();
          ctx.restore();
          const head = drawPolylineStreak([c0, c1], ease(q), 0.6 * fade, "160,240,240", 1.8);
          ctx.save();
          ctx.globalCompositeOperation = "lighter";
          drawSprite(glowWhite, head.x, head.y, 30, 0.85 * fade);
          ctx.restore();
        }
      }

      // Nodes.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < N; i++) {
        const w = wob[i];
        const tw = 0.75 + 0.25 * Math.sin(TAU * 2 * p + w.tw);
        drawSprite(i % 2 ? glowTeal : glowCyan, P[i].x, P[i].y, 64 * w.z, 0.75 * tw);
        drawSprite(glowWhite, P[i].x, P[i].y, 15 * w.z, tw);
      }
      ctx.restore();

      // Slow orbit ring around the whole cluster with one travelling light.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(120,210,230,0.07)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 560, 330, 0, 0, TAU);
      ctx.stroke();
      const oa = TAU * p;
      drawSprite(glowWhite, cx + Math.cos(oa) * 560, cy + Math.sin(oa) * 330, 26, 0.7);
      drawSprite(glowCyan, cx + Math.cos(oa) * 560, cy + Math.sin(oa) * 330, 80, 0.4);
      ctx.restore();

      ctx.globalCompositeOperation = "source-over";
      const vig = ctx.createRadialGradient(cx, cy, H * 0.4, cx, cy, W * 0.72);
      vig.addColorStop(0, "rgba(4,8,16,0)");
      vig.addColorStop(1, "rgba(4,8,16,0.5)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    };
  }

  const draw = name === "hero-bg" ? heroScene() : skillsScene();
  window.renderFrame = (t) => draw(((t % T) + T) % T);
}

/* -------------------------------------------------------------------------- */
/* Render + encode                                                              */
/* -------------------------------------------------------------------------- */

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    stdio: "inherit",
  });
}

async function renderScene(browser, { name, seconds }) {
  const frames = seconds * FPS;
  const dir = mkdtempSync(join(tmpdir(), `backdrop-${name}-`));
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  try {
    await page.setContent(
      "<!doctype html><html><body style='margin:0;overflow:hidden;background:#000'></body></html>",
    );
    await page.addScriptTag({
      content: `(${scene.toString()})(${JSON.stringify(name)}, ${WIDTH}, ${HEIGHT}, ${seconds});`,
    });

    const started = Date.now();
    for (let i = 0; i < frames; i++) {
      await page.evaluate((t) => window.renderFrame(t), i / FPS);
      await page.screenshot({
        path: join(dir, `frame_${String(i).padStart(4, "0")}.jpg`),
        type: "jpeg",
        quality: 92,
      });
      if (i % 50 === 0) process.stdout.write(`  ${name}: frame ${i}/${frames}\r`);
    }
    console.log(`  ${name}: ${frames} frames in ${((Date.now() - started) / 1000).toFixed(1)}s`);

    const input = ["-framerate", String(FPS), "-i", join(dir, "frame_%04d.jpg")];
    const mp4 = join(outDir, `${name}.mp4`);
    const webm = join(outDir, `${name}.webm`);
    const poster = join(outDir, `${name}.jpg`);

    ffmpeg([
      ...input,
      "-c:v", "libx264", "-preset", "slow", "-crf", "24",
      "-pix_fmt", "yuv420p", "-g", String(FPS * 2),
      "-movflags", "+faststart", "-an", mp4,
    ]);
    ffmpeg([
      ...input,
      "-c:v", "libvpx-vp9", "-crf", "36", "-b:v", "0", "-row-mt", "1",
      "-deadline", "good", "-cpu-used", "2", "-g", String(FPS * 2),
      "-pix_fmt", "yuv420p", "-an", webm,
    ]);
    ffmpeg(["-i", join(dir, "frame_0000.jpg"), "-q:v", "3", poster]);

    for (const f of [mp4, webm, poster]) {
      console.log(`  ${f.slice(root.length + 1)}  ${(statSync(f).size / 1024).toFixed(0)} KB`);
    }
  } finally {
    await page.close();
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Merge entries into the manifest, keeping every other key as it is. */
function register(names) {
  // Re-read right before writing: other scripts own other keys in this file.
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const name of names) {
    manifest[name] = {
      mp4: `/media/${name}.mp4`,
      webm: `/media/${name}.webm`,
      poster: `/media/${name}.jpg`,
      source: "generated: scripts/render-backdrops.mjs",
    };
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

/** `--stills <dir>`: write a few PNG frames per scene for a quick look, no encode. */
async function stills(browser, scenes, dir) {
  mkdirSync(dir, { recursive: true });
  for (const { name, seconds } of scenes) {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    await page.setContent("<!doctype html><html><body style='margin:0;overflow:hidden'></body></html>");
    await page.addScriptTag({
      content: `(${scene.toString()})(${JSON.stringify(name)}, ${WIDTH}, ${HEIGHT}, ${seconds});`,
    });
    for (const k of [0, 0.3, 0.6, 0.85]) {
      await page.evaluate((t) => window.renderFrame(t), k * seconds);
      await page.screenshot({ path: join(dir, `${name}-${Math.round(k * 100)}.png`) });
    }
    await page.close();
  }
  console.log(`Stills written to ${dir}`);
}

/**
 * Launch Chromium. If Playwright's own browser revision is not downloaded,
 * fall back to `CHROMIUM_PATH` or any Chromium already under
 * PLAYWRIGHT_BROWSERS_PATH — the canvas work needs nothing version-specific.
 */
async function launch() {
  try {
    return await chromium.launch();
  } catch (err) {
    const candidates = [];
    if (process.env.CHROMIUM_PATH) candidates.push(process.env.CHROMIUM_PATH);
    const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
    if (base && existsSync(base)) {
      for (const d of readdirSync(base).sort().reverse()) {
        candidates.push(
          join(base, d, "chrome-headless-shell-linux64", "chrome-headless-shell"),
          join(base, d, "chrome-linux64", "chrome"),
          join(base, d, "chrome-linux", "chrome"),
        );
      }
    }
    const executablePath = candidates.find((c) => existsSync(c));
    if (!executablePath) throw err;
    console.log(`Using ${executablePath}`);
    return chromium.launch({ executablePath });
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const stillsAt = argv.indexOf("--stills");
  const stillsDir = stillsAt >= 0 ? argv.splice(stillsAt, 2)[1] : null;
  const wanted = argv;
  const scenes = wanted.length ? SCENES.filter((s) => wanted.includes(s.name)) : SCENES;
  if (!scenes.length) {
    console.error(`Unknown scene. Choose from: ${SCENES.map((s) => s.name).join(", ")}`);
    process.exit(1);
  }
  mkdirSync(outDir, { recursive: true });

  const browser = await launch();
  try {
    if (stillsDir) return await stills(browser, scenes, stillsDir);
    for (const s of scenes) await renderScene(browser, s);
  } finally {
    await browser.close();
  }
  register(scenes.map((s) => s.name));
  console.log(`Updated ${manifestPath.slice(root.length + 1)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
