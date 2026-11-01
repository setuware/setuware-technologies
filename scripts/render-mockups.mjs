#!/usr/bin/env node
/**
 * Render the site's image slots as original product mockups.
 *
 *   npm run media:mockups              # all ten slots
 *   npm run media:mockups -- aboutOffice serviceWeb   # just these
 *
 * Every scene below is plain HTML/CSS (fonts: Manrope + Sora from Google
 * Fonts). Each one is screenshotted with Playwright at its slot's exact size
 * and a device scale factor of 2, then downscaled to the exact slot size and
 * encoded as a progressive JPEG (quality 85, ≤ 350 KB) — Python PIL when it is
 * available, ffmpeg otherwise.
 *
 * All brands, people and numbers shown are fictional UI demo content.
 *
 * Output:
 *   public/images/photos/<file>.jpg
 *   src/lib/media-manifest.json   ("images" key only; other keys preserved)
 */

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "images", "photos");
const manifestPath = join(root, "src", "lib", "media-manifest.json");
const MAX_BYTES = 350 * 1024;

/* ------------------------------------------------------------------ */
/* Design tokens, icons and shared helpers                             */
/* ------------------------------------------------------------------ */

const C = {
  cyan: "#00a1c6",
  blue: "#0061a8",
  ink: "#0b1020",
  mist: "#f4f7fb",
  line: "#e3e9f1",
  muted: "#5d6779",
  green: "#16a34a",
  amber: "#f59e0b",
};

const ICONS = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  database:
    '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/>',
  server: '<rect x="3" y="3" width="18" height="8" rx="2"/><rect x="3" y="13" width="18" height="8" rx="2"/><path d="M7 7h.01M7 17h.01"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  msg: '<path d="M21 11.5a8.4 8.4 0 0 1-12.2 7.5L3 21l2-5.8A8.5 8.5 0 1 1 21 11.5z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
  trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  bars: '<path d="M3 3v18h18"/><path d="M7 16v-5M12 16V8M17 16V6"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  truck: '<path d="M1 4h14v12H1z"/><path d="M15 8h4l4 4v4h-8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  heart:
    '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  video: '<path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  phone:
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  frame: '<path d="M22 6H2M22 18H2M6 2v20M18 2v20"/>',
  type: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  square: '<rect x="3" y="3" width="18" height="18" rx="2"/>',
  move: '<path d="M4 3l7 18 2.5-7.5L21 11z"/>',
  kitchen: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 10h18M8 6h.01M12 14v4"/>',
  sofa: '<path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3"/><path d="M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2z"/><path d="M5 18v2M19 18v2"/>',
  wardrobe: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 2v20M9.5 11v2M14.5 11v2"/>',
  stethoscope:
    '<path d="M5 3v6a5 5 0 0 0 10 0V3"/><path d="M10 14v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',
  tooth: '<path d="M12 5c-1.5-1.5-6-2.5-7 1.5-.8 3.2.8 5 1.5 8 .6 2.5 1 6 2.5 6s1.5-4 3-4 1.5 4 3 4 1.9-3.5 2.5-6c.7-3 2.3-4.8 1.5-8-1-4-5.5-3-7-1.5z"/>',
  baby: '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 0 0 5 0"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
};

/** Inline stroke icon. */
const I = (name, size = 16, color = "currentColor", sw = 2) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" style="flex:none">${ICONS[name]}</svg>`;

const STAR = (size = 12, color = "#f5b301") =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" style="flex:none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg>`;

const WHATSAPP = (size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#fff" style="flex:none"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>`;

/** Initial-circle avatar. */
const av = (initials, bg, size = 28, fs) =>
  `<span class="av" style="width:${size}px;height:${size}px;background:${bg};font-size:${fs ?? Math.round(size * 0.38)}px">${initials}</span>`;

/** Smooth (Catmull-Rom → cubic Bézier) SVG path through points. */
function smooth(pts) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/** Map values to points inside a w×h box (y grows downwards). */
function toPts(values, w, h, min, max, padTop = 0) {
  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  return values.map((v, i) => [
    (i / (values.length - 1)) * w,
    padTop + (1 - (v - lo) / (hi - lo)) * (h - padTop),
  ]);
}

/** Area + line chart as an inline SVG string. */
function areaChart({ values, w, h, min, max, color, id, strokeW = 3, fillOpacity = 0.28, padTop = 8, dash }) {
  const pts = toPts(values, w, h, min, max, padTop);
  const line = smooth(pts);
  const area = `${line} L${w},${h} L0,${h} Z`;
  return `
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity="${fillOpacity}"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    ${fillOpacity > 0 ? `<path d="${area}" fill="url(#${id})"/>` : ""}
    <path d="${line}" fill="none" stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ""}/>`;
}

const chartPoint = (values, w, h, min, max, index, padTop = 8) => toPts(values, w, h, min, max, padTop)[index];

/** Browser chrome. */
const chrome = (url, { dark = false } = {}) => `
  <div class="bar${dark ? " dark" : ""}">
    <i class="dot" style="background:#ff5f57"></i><i class="dot" style="background:#febc2e"></i><i class="dot" style="background:#28c840"></i>
    <div class="url">${I("lock", 11, dark ? "#8b95a8" : "#7a8496", 2.4)}<span>${url}</span></div>
    <span style="width:52px"></span>
  </div>`;

/** Phone shell; `inner` fills the screen. */
const phone = (inner, cls = "", style = "") => `
  <div class="phone ${cls}" style="${style}">
    <div class="screen">
      <div class="status"><span>9:41</span><span class="island"></span><span class="sig"><i></i><i></i><i></i><b></b></span></div>
      ${inner}
    </div>
  </div>`;

/** Illustrated living room (used as the "photo" inside website mockups). */
const room = (extra = "") => `
  <div class="room" ${extra}>
    <div class="r-wall"></div>
    <div class="r-arch"><div class="r-sky"></div></div>
    <div class="r-art"></div>
    <div class="r-lampcord"></div><div class="r-shade"></div><div class="r-glow"></div>
    <div class="r-floor"></div>
    <div class="r-rug"></div>
    <div class="r-plant"><b style="transform:rotate(-38deg)"></b><b style="transform:rotate(-8deg)"></b><b style="transform:rotate(24deg)"></b><b style="transform:rotate(52deg)"></b><i></i></div>
    <div class="r-sofa"><span class="back"></span><span class="seat"></span><span class="arm l"></span><span class="arm r"></span><span class="cush c1"></span><span class="cush c2"></span><span class="cush c3"></span></div>
    <div class="r-table"><i></i></div>
  </div>`;

const FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700&display=block" rel="stylesheet">`;

const BASE_CSS = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{overflow:hidden}
body{font-family:Manrope,system-ui,sans-serif;color:${C.ink};-webkit-font-smoothing:antialiased;position:relative;font-feature-settings:"tnum" 0}
.sora{font-family:Sora,Manrope,sans-serif}
.num{font-variant-numeric:tabular-nums}
.abs{position:absolute}
.row{display:flex;align-items:center}
.col{display:flex;flex-direction:column}
.av{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;color:#fff!important;font-weight:700;flex:none;letter-spacing:.02em}
.stack{display:flex}.stack .av{box-shadow:0 0 0 2px #fff;margin-left:-8px}.stack .av:first-child{margin-left:0}
.card{background:#fff;border-radius:18px;box-shadow:0 1px 2px rgba(11,16,32,.05),0 12px 32px -12px rgba(11,16,32,.18)}
.pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;font-weight:700}
.browser{position:absolute;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 6px rgba(11,16,32,.08),0 40px 80px -30px rgba(11,16,32,.45)}
.bar{height:40px;display:flex;align-items:center;gap:7px;padding:0 14px;background:#eef2f7;border-bottom:1px solid #e1e7ef}
.bar.dark{background:#141b2e;border-color:#232c43}
.dot{width:11px;height:11px;border-radius:50%;display:block}
.url{flex:1;margin:0 40px;height:24px;border-radius:7px;background:#fff;font-size:11.5px;font-weight:600;color:#5b6475;display:flex;align-items:center;justify-content:center;gap:6px}
.bar.dark .url{background:#0d1324;color:#8b95a8}
.phone{position:absolute;border-radius:46px;background:linear-gradient(145deg,#2a3142,#0b1020 40%,#1b2232);padding:11px;box-shadow:0 0 0 1.5px #3a4256 inset,0 50px 90px -30px rgba(11,16,32,.55),0 18px 36px -18px rgba(11,16,32,.4)}
.phone .screen{position:relative;width:100%;height:100%;border-radius:36px;overflow:hidden;background:#fff}
.status{height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 26px 0 30px;font-size:13px;font-weight:700;position:relative;z-index:3}
.status .island{position:absolute;left:50%;top:10px;transform:translateX(-50%);width:92px;height:27px;background:#000;border-radius:20px}
.status .sig{display:flex;align-items:flex-end;gap:2px}
.status .sig i{display:block;width:3px;background:currentColor;border-radius:1px}
.status .sig i:nth-child(1){height:5px}.status .sig i:nth-child(2){height:7px}.status .sig i:nth-child(3){height:9px}
.status .sig b{display:block;width:20px;height:10px;border:1.5px solid currentColor;border-radius:3px;margin-left:5px;position:relative}
.status .sig b::after{content:"";position:absolute;inset:1.5px 4px 1.5px 1.5px;background:currentColor;border-radius:1px}

/* illustrated room */
.room{position:absolute;inset:0;overflow:hidden;background:#e8dccb}
.r-wall{position:absolute;inset:0 0 30% 0;background:linear-gradient(180deg,#f1e8db,#e3d4c0)}
.r-floor{position:absolute;left:0;right:0;bottom:0;height:30%;background:linear-gradient(180deg,#c99f77,#a97d57)}
.r-floor::before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,transparent 0 11%,rgba(80,50,25,.12) 11% 11.4%)}
.r-arch{position:absolute;left:60%;top:10%;width:27%;height:60%;border-radius:999px 999px 0 0;background:#f8f2ea;box-shadow:0 0 0 1px rgba(120,90,60,.08)}
.r-sky{position:absolute;inset:7% 9% 0 9%;border-radius:999px 999px 0 0;background:linear-gradient(180deg,#a9daea,#e9f2ee 70%,#f6e9d4)}
.r-sky::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent 48.5%,#f8f2ea 48.5% 51.5%,transparent 51.5%),linear-gradient(180deg,transparent 44%,#f8f2ea 44% 47%,transparent 47%)}
.r-art{position:absolute;left:15%;top:15%;width:21%;height:25%;background:linear-gradient(135deg,#0061a8,#00a1c6 45%,#f2c38b 46%,#e7a86b);border:5px solid #fff;box-shadow:0 8px 18px -8px rgba(60,40,20,.45)}
.r-lampcord{position:absolute;left:46%;top:0;width:2px;height:17%;background:#3a3a3a}
.r-shade{position:absolute;left:41.5%;top:17%;width:9.5%;height:8%;border-radius:999px 999px 0 0;background:linear-gradient(180deg,#24474c,#1a3539)}
.r-glow{position:absolute;left:34%;top:22%;width:25%;height:30%;background:radial-gradient(closest-side,rgba(255,226,170,.55),transparent);}
.r-rug{position:absolute;left:6%;bottom:2%;width:66%;height:15%;border-radius:50%;background:#efe4d1;box-shadow:inset 0 0 0 6px #e3d3b8}
.r-sofa{position:absolute;left:9%;bottom:16%;width:52%;height:27%}
.r-sofa span{position:absolute;display:block}
.r-sofa .back{left:6%;right:6%;top:0;height:62%;border-radius:18% 18% 6% 6%/30% 30% 10% 10%;background:linear-gradient(180deg,#2f6f72,#2a6467)}
.r-sofa .seat{left:4%;right:4%;bottom:6%;height:44%;border-radius:14px;background:linear-gradient(180deg,#3d8487,#33777a)}
.r-sofa .arm{bottom:6%;width:12%;height:66%;border-radius:40% 40% 12% 12%/24% 24% 8% 8%;background:linear-gradient(180deg,#2d6b6e,#275f62)}
.r-sofa .arm.l{left:0}.r-sofa .arm.r{right:0}
.r-sofa .cush{top:20%;width:15%;height:34%;border-radius:22%}
.r-sofa .c1{left:16%;background:#e9b872;transform:rotate(-8deg)}
.r-sofa .c2{left:33%;background:#f3e6cf;transform:rotate(4deg)}
.r-sofa .c3{right:16%;background:#d9805f;transform:rotate(9deg)}
.r-table{position:absolute;left:30%;bottom:8%;width:24%;height:5%;border-radius:50%;background:#6b4a32;box-shadow:0 6px 0 -1px #553a27}
.r-table i{position:absolute;left:38%;top:-120%;width:14%;height:130%;border-radius:30% 30% 10% 10%;background:#f4efe6}
.r-plant{position:absolute;right:5%;bottom:22%;width:12%;height:42%}
.r-plant b{position:absolute;left:30%;bottom:22%;width:42%;height:62%;border-radius:50% 50% 50% 50%/70% 70% 30% 30%;background:linear-gradient(180deg,#4f9a63,#2f7046);transform-origin:50% 100%}
.r-plant i{position:absolute;left:18%;right:18%;bottom:0;height:28%;border-radius:8% 8% 22% 22%;background:linear-gradient(180deg,#e2cdb0,#cbb08c)}
`;

function doc(w, h, css, body) {
  return `<!doctype html><html><head><meta charset="utf-8">${FONT_LINK}<style>${BASE_CSS}
html,body{width:${w}px;height:${h}px}
${css}</style></head><body>${body}</body></html>`;
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

/** Mini "Sharma Interiors" desktop site used in the hero. */
function sharmaSite() {
  const svc = [
    ["kitchen", "Modular kitchens", "From ₹1.8L · 45 days"],
    ["wardrobe", "Wardrobes & storage", "From ₹65,000"],
    ["sofa", "Living rooms", "Custom furniture"],
    ["home", "Full-home interiors", "2 & 3 BHK packages"],
  ];
  return `
  <div class="si">
    <nav class="si-nav row">
      <div class="row" style="gap:9px"><span class="si-logo">S</span><b class="sora" style="font-size:15px;letter-spacing:-.01em">Sharma Interiors</b></div>
      <div class="row si-links"><span class="on">Home</span><span>Services</span><span>Projects</span><span>Pricing</span><span>Contact</span></div>
      <span class="si-btn">Book a consultation</span>
    </nav>
    <section class="si-hero">
      <div class="col" style="gap:16px;padding-top:10px">
        <span class="pill" style="background:#e6f6fa;color:#007f9d;font-size:11px;padding:6px 11px;align-self:flex-start">${I("pin", 12, "#007f9d", 2.4)} Pune · Mumbai · Nashik</span>
        <h1 class="sora">Homes designed around the way you live.</h1>
        <p>Modular kitchens, wardrobes and full-home interiors — designed in 3D, built in our own workshop and installed on schedule.</p>
        <div class="row" style="gap:10px;margin-top:4px">
          <span class="si-cta">Get a free quote ${I("arrow", 14, "#fff", 2.4)}</span>
          <span class="si-ghost">View projects</span>
        </div>
        <div class="row si-stats">
          <div><b class="sora">1,200+</b><span>homes delivered</span></div>
          <div><b class="sora">4.9 ${STAR(13)}</b><span>average rating</span></div>
          <div><b class="sora">10 yr</b><span>warranty</span></div>
        </div>
      </div>
      <div class="si-photo">${room()}
        <div class="si-chip"><span class="si-chip-ic">${I("kitchen", 15, "#0061a8")}</span><div class="col"><b>Modular kitchen</b><span>from ₹1,80,000</span></div></div>
      </div>
    </section>
    <section class="si-svc">
      ${svc
        .map(
          ([ic, t, s]) => `<div class="si-card"><span class="si-ic">${I(ic, 18, "#0061a8")}</span><b>${t}</b><span>${s}</span></div>`,
        )
        .join("")}
    </section>
  </div>`;
}

const sharmaCss = `
.si{background:#fff;height:100%}
.si-nav{justify-content:space-between;padding:16px 30px;border-bottom:1px solid #eef1f5}
.si-logo{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#00a1c6,#0061a8);color:#fff;font:700 15px Sora;display:flex;align-items:center;justify-content:center}
.si-links{gap:22px;font-size:12.5px;font-weight:600;color:#5d6779}.si-links .on{color:#0b1020}
.si-btn{font-size:12px;font-weight:700;color:#fff;background:#0b1020;padding:9px 14px;border-radius:999px}
.si-hero{display:grid;grid-template-columns:1fr 1.05fr;gap:28px;padding:30px 30px 22px}
.si-hero h1{font-size:36px;line-height:1.08;letter-spacing:-.03em;font-weight:600}
.si-hero p{font-size:13.5px;line-height:1.6;color:#5d6779;max-width:340px}
.si-cta{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#00a1c6,#0061a8);color:#fff;font-weight:700;font-size:13px;padding:12px 18px;border-radius:999px;box-shadow:0 10px 20px -8px rgba(0,97,168,.6)}
.si-ghost{font-weight:700;font-size:13px;padding:11px 16px;border-radius:999px;border:1.5px solid #dfe5ee}
.si-stats{gap:26px;margin-top:12px;padding-top:16px;border-top:1px solid #eef1f5}
.si-stats div{display:flex;flex-direction:column;gap:2px}.si-stats b{font-size:18px;display:flex;align-items:center;gap:4px}.si-stats span{font-size:11px;color:#7a8496;font-weight:600}
.si-photo{position:relative;border-radius:18px;overflow:hidden;height:290px}
.si-chip{position:absolute;left:14px;bottom:14px;display:flex;gap:10px;align-items:center;background:rgba(255,255,255,.94);border-radius:14px;padding:9px 13px 9px 9px;box-shadow:0 10px 24px -10px rgba(0,0,0,.35)}
.si-chip-ic{width:32px;height:32px;border-radius:10px;background:#e8f1fa;display:flex;align-items:center;justify-content:center}
.si-chip b{font-size:12px}.si-chip span{font-size:11px;color:#5d6779;font-weight:600}
.si-svc{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:6px 30px 30px}
.si-card{border:1px solid #edf0f5;border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:4px;background:#fbfcfe}
.si-card b{font-size:13px;margin-top:8px}.si-card span{font-size:11px;color:#7a8496;font-weight:600}
.si-ic{width:34px;height:34px;border-radius:10px;background:#e8f1fa;display:flex;align-items:center;justify-content:center}
`;

function sceneHero() {
  const W = 1920,
    H = 1080;
  const css = `
  ${sharmaCss}
  body{background:#060a16}
  .bg{position:absolute;inset:0;background:
    radial-gradient(900px 640px at 74% 46%,rgba(0,161,198,.34),transparent 65%),
    radial-gradient(800px 600px at 100% 100%,rgba(0,97,168,.5),transparent 60%),
    radial-gradient(700px 500px at 60% 0%,rgba(0,97,168,.22),transparent 70%),
    linear-gradient(110deg,#04060d 0%,#060a17 42%,#0a1631 100%)}
  .grid{position:absolute;inset:0;background-image:radial-gradient(rgba(140,190,230,.16) 1px,transparent 1.2px);background-size:28px 28px;-webkit-mask-image:linear-gradient(90deg,transparent 40%,#000 70%);mask-image:linear-gradient(90deg,transparent 40%,#000 70%)}
  .ring{position:absolute;border-radius:50%;border:1px solid rgba(0,161,198,.18)}
  .stage{position:absolute;inset:0;perspective:2400px}
  .hb{left:1010px;top:140px;width:860px;height:700px;transform:rotateY(9deg) rotateX(2deg);transform-origin:100% 50%;box-shadow:0 0 0 1px rgba(255,255,255,.06),0 60px 120px -30px rgba(0,0,0,.8),0 0 120px -20px rgba(0,161,198,.45)}
  .hp{left:900px;top:540px;width:282px;height:580px;transform:rotate(-4deg);z-index:5;box-shadow:0 0 0 1.5px #3a4256 inset,0 60px 100px -20px rgba(0,0,0,.85),0 0 80px -10px rgba(0,161,198,.5)}
  .m-nav{display:flex;justify-content:space-between;align-items:center;padding:6px 18px 12px}
  .m-photo{position:relative;height:200px;margin:0 12px;border-radius:20px;overflow:hidden}
  .m-body{padding:16px 18px;display:flex;flex-direction:column;gap:10px}
  .m-body h2{font:600 22px/1.12 Sora;letter-spacing:-.025em}
  .m-body p{font-size:11.5px;line-height:1.55;color:#5d6779}
  .m-cta{display:flex;justify-content:center;align-items:center;gap:8px;background:linear-gradient(135deg,#00a1c6,#0061a8);color:#fff;font-weight:700;font-size:13px;padding:12px;border-radius:999px}
  .m-list{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px}
  .m-list div{border:1px solid #edf0f5;border-radius:12px;padding:10px;font-size:11px;font-weight:700;display:flex;flex-direction:column;gap:6px;background:#fbfcfe}
  .fl{position:absolute;z-index:6;background:rgba(255,255,255,.97);border-radius:18px;box-shadow:0 30px 60px -20px rgba(0,0,0,.7)}
  .fl-lead{left:1610px;top:62px;width:280px;padding:16px;transform:rotate(1.5deg)}
  .fl-score{left:1680px;top:836px;width:200px;padding:16px;display:flex;gap:14px;align-items:center}
  .k{font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7a8496}
  `;
  const mobile = `
    <div class="m-nav"><div class="row" style="gap:8px"><span class="si-logo" style="width:24px;height:24px;font-size:13px;border-radius:7px">S</span><b class="sora" style="font-size:13px">Sharma Interiors</b></div>${I("menu", 18)}</div>
    <div class="m-photo">${room()}</div>
    <div class="m-body">
      <span class="pill" style="background:#e6f6fa;color:#007f9d;font-size:10px;padding:5px 9px;align-self:flex-start">${I("pin", 10, "#007f9d", 2.4)} Pune · Mumbai · Nashik</span>
      <h2>Homes designed around the way you live.</h2>
      <p>Designed in 3D, built in our own workshop, installed on schedule.</p>
      <span class="m-cta">Get a free quote ${I("arrow", 13, "#fff", 2.4)}</span>
      <div class="m-list"><div>${I("kitchen", 16, "#0061a8")}Modular kitchens</div><div>${I("wardrobe", 16, "#0061a8")}Wardrobes</div></div>
    </div>`;
  const body = `
  <div class="bg"></div><div class="grid"></div>
  <div class="ring" style="left:1080px;top:-120px;width:1100px;height:1100px"></div>
  <div class="ring" style="left:1230px;top:30px;width:800px;height:800px;border-color:rgba(0,161,198,.12)"></div>
  <div class="stage">
    <div class="browser hb">${chrome("sharmainteriors.in")}${sharmaSite()}</div>
    ${phone(mobile, "hp")}
    <div class="fl fl-lead">
      <div class="row" style="justify-content:space-between;margin-bottom:12px"><span class="k">New enquiry</span><span class="pill" style="font-size:10.5px;padding:4px 9px;background:#e8f8ee;color:#15803d"><i style="width:6px;height:6px;border-radius:50%;background:#16a34a;display:block"></i>Just now</span></div>
      <div class="row" style="gap:11px">${av("RK", "linear-gradient(135deg,#00a1c6,#0061a8)", 38)}<div class="col" style="gap:2px"><b style="font-size:14px">Rohan Kulkarni</b><span style="font-size:12px;color:#5d6779;font-weight:600">3 BHK · Baner, Pune</span></div></div>
      <div class="row" style="justify-content:space-between;margin-top:12px;padding-top:12px;border-top:1px solid #eef1f5;font-size:12px;font-weight:700"><span style="color:#5d6779">Budget</span><span>₹6,50,000</span></div>
    </div>
    <div class="fl fl-score">
      <svg width="58" height="58" viewBox="0 0 58 58"><circle cx="29" cy="29" r="24" fill="none" stroke="#e6f6ec" stroke-width="6"/><circle cx="29" cy="29" r="24" fill="none" stroke="#16a34a" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(2 * Math.PI * 24 * 0.98).toFixed(1)} 200" transform="rotate(-90 29 29)"/><text x="29" y="34" text-anchor="middle" font-family="Sora" font-weight="700" font-size="16" fill="#0b1020">98</text></svg>
      <div class="col" style="gap:3px"><span class="k">Performance</span><b style="font-size:13px">Loads in 1.1 s</b><span style="font-size:11px;color:#5d6779;font-weight:600">Mobile · 4G</span></div>
    </div>
  </div>`;
  return doc(W, H, css, body);
}

function sceneAbout() {
  const W = 1080,
    H = 1200;
  const swatches = [
    ["#00a1c6", "Cyan", "Primary"],
    ["#0061a8", "Blue", "Links"],
    ["#0b1020", "Ink", "Text"],
    ["#f4f7fb", "Mist", "Surface"],
    ["#ffb547", "Saffron", "Accent"],
  ];
  const sticky = (text, bg, rot, who, whoBg) =>
    `<div class="st" style="background:${bg};transform:rotate(${rot}deg)"><span>${text}</span>${av(who, whoBg, 22, 9)}</div>`;
  const css = `
  body{background:linear-gradient(160deg,#f7f9fc,#e9f0f8)}
  .blob{position:absolute;border-radius:50%;filter:blur(60px)}
  .fig{left:56px;top:84px;width:968px;height:530px;transform:rotate(-1.6deg);border-radius:20px;display:grid;grid-template-rows:44px 1fr;background:#fff}
  .fg-top{background:#1d1f27;display:flex;align-items:center;gap:6px;padding:0 14px;color:#cfd3dc}
  .fg-tool{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center}
  .fg-tool.on{background:#00a1c6}
  .fg-main{display:grid;grid-template-columns:190px 1fr 200px;min-height:0}
  .fg-layers{border-right:1px solid #eceff4;padding:14px 12px;font-size:12px;font-weight:600;color:#3d4556;display:flex;flex-direction:column;gap:3px}
  .fg-layers .h{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#8a93a4;font-weight:800;margin:4px 6px 6px}
  .ly{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:7px}
  .ly.on{background:#e6f6fa;color:#007f9d}
  .ly.in{padding-left:24px}
  .fg-canvas{position:relative;background:#eef1f6;background-image:radial-gradient(#d5dbe5 1px,transparent 1.2px);background-size:16px 16px;overflow:hidden}
  .fg-props{border-left:1px solid #eceff4;padding:14px;font-size:11.5px;font-weight:600;color:#3d4556;display:flex;flex-direction:column;gap:14px}
  .fg-props .h{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:#8a93a4;font-weight:800;margin-bottom:6px}
  .pr{display:grid;grid-template-columns:1fr 1fr;gap:6px}
  .pr span{background:#f3f5f9;border-radius:6px;padding:6px 8px;display:flex;justify-content:space-between}
  .pr span i{font-style:normal;color:#8a93a4}
  .frm{position:absolute;background:#fff;border-radius:6px;box-shadow:0 8px 24px -10px rgba(11,16,32,.25)}
  .frm-l{position:absolute;font-size:10.5px;font-weight:700;color:#7a8496;top:-18px;left:0}
  .sel{position:absolute;border:1.5px solid #0d99ff}
  .sel i{position:absolute;width:8px;height:8px;background:#fff;border:1.5px solid #0d99ff}
  .size{position:absolute;background:#0d99ff;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px}
  .cur{position:absolute;display:flex;align-items:flex-start;gap:2px}
  .cur span{font-size:11px;font-weight:700;color:#fff;padding:3px 8px;border-radius:6px 999px 999px 999px;margin-top:14px}
  .pal{left:60px;top:664px;width:480px;padding:24px;transform:rotate(1.8deg)}
  .pal-row{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:16px}
  .sw{height:96px;border-radius:14px;box-shadow:inset 0 0 0 1px rgba(11,16,32,.06)}
  .sw-l{font-size:12px;font-weight:800;margin-top:8px}.sw-h{font-size:10.5px;font-weight:600;color:#7a8496;text-transform:uppercase}
  .ty{left:568px;top:646px;width:452px;padding:24px;transform:rotate(-2.2deg)}
  .ty .big{font:600 92px/0.9 Sora;letter-spacing:-.04em;background:linear-gradient(135deg,#00a1c6,#0061a8);-webkit-background-clip:text;color:transparent}
  .scale{display:flex;flex-direction:column;gap:7px;margin-top:6px}
  .scale div{display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid #eef1f5;padding-top:7px}
  .scale i{font-style:normal;font-size:11px;color:#7a8496;font-weight:600}
  .k{font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:#7a8496}
  .board{left:70px;top:916px;width:940px;height:196px;padding:18px 22px;transform:rotate(.6deg);background:#fff}
  .cols{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:12px}
  .cols h4{font-size:11.5px;font-weight:800;color:#5d6779;display:flex;justify-content:space-between;margin-bottom:10px}
  .cols h4 i{font-style:normal;background:#eef2f7;border-radius:999px;padding:1px 8px}
  .sts{display:flex;gap:10px}
  .st{flex:1;height:100px;padding:10px;border-radius:4px 4px 14px 4px;font-size:12.5px;font-weight:700;line-height:1.35;color:#2b2f3a;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 10px 16px -10px rgba(60,50,20,.45)}
  .st .av{align-self:flex-end}
  `;
  const body = `
  <div class="blob" style="left:-120px;top:520px;width:520px;height:420px;background:rgba(0,161,198,.18)"></div>
  <div class="blob" style="right:-160px;top:-80px;width:560px;height:460px;background:rgba(0,97,168,.14)"></div>
  <div class="card abs fig" style="overflow:hidden">
    <div class="fg-top">
      <span class="fg-tool">${I("menu", 16, "#cfd3dc")}</span>
      <span class="fg-tool on">${I("move", 15, "#fff")}</span>
      <span class="fg-tool">${I("frame", 15, "#cfd3dc")}</span>
      <span class="fg-tool">${I("square", 15, "#cfd3dc")}</span>
      <span class="fg-tool">${I("pen", 15, "#cfd3dc")}</span>
      <span class="fg-tool">${I("type", 15, "#cfd3dc")}</span>
      <span style="flex:1;text-align:center;font-size:12.5px;font-weight:700;color:#fff">FreshKart — Website redesign <span style="color:#8a93a4;font-weight:600">/ Home</span></span>
      <span class="stack" style="margin-right:8px">${av("AS", "#e8508a", 26)}${av("RM", "#00a1c6", 26)}${av("KP", "#7c5cff", 26)}</span>
      <span style="font-size:12px;font-weight:800;background:#0d99ff;color:#fff;padding:7px 12px;border-radius:7px">Share</span>
    </div>
    <div class="fg-main">
      <div class="fg-layers">
        <span class="h">Layers</span>
        <span class="ly">${I("frame", 13, "#8a93a4")}Home — Desktop</span>
        <span class="ly in on">${I("square", 13, "#007f9d")}Hero</span>
        <span class="ly in">${I("type", 13, "#8a93a4")}Headline</span>
        <span class="ly in">${I("square", 13, "#8a93a4")}Category grid</span>
        <span class="ly in">${I("square", 13, "#8a93a4")}Offers banner</span>
        <span class="ly in">${I("square", 13, "#8a93a4")}Footer</span>
        <span class="ly">${I("frame", 13, "#8a93a4")}Home — Mobile</span>
        <span class="ly">${I("frame", 13, "#8a93a4")}Checkout</span>
        <span class="h" style="margin-top:14px">Components</span>
        <span class="ly">${I("grid", 13, "#8a93a4")}Button / Primary</span>
        <span class="ly">${I("grid", 13, "#8a93a4")}Product card</span>
      </div>
      <div class="fg-canvas">
        <div class="frm" style="left:40px;top:46px;width:360px;height:420px;overflow:hidden">
          <span class="frm-l" style="position:relative;display:none"></span>
          <div style="height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;border-bottom:1px solid #f0f2f6"><b class="sora" style="font-size:12px;color:#15803d">FreshKart</b><span style="display:flex;gap:10px;font-size:8.5px;font-weight:700;color:#7a8496"><span>Fruits</span><span>Dairy</span><span>Staples</span></span></div>
          <div style="margin:12px;border-radius:12px;height:150px;background:linear-gradient(135deg,#e7f8ec,#d4f0e0);position:relative;padding:16px">
            <b class="sora" style="font-size:19px;line-height:1.1;display:block;max-width:180px;letter-spacing:-.02em">Groceries at your door in 30 minutes</b>
            <span style="display:inline-block;margin-top:10px;font-size:9px;font-weight:800;background:#15803d;color:#fff;padding:6px 10px;border-radius:999px">Shop now</span>
            <div style="position:absolute;right:16px;bottom:16px;width:96px;height:96px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ffcf6b,#f59e0b)"></div>
            <div style="position:absolute;right:76px;bottom:20px;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ff8b7a,#e5484d)"></div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:0 12px">
            ${["#fde7c7", "#dff3ff", "#ffe1e6", "#e9e4ff"].map((c, i) => `<div style="background:${c};border-radius:10px;height:62px;display:flex;align-items:flex-end;padding:6px;font-size:8.5px;font-weight:800">${["Fruits", "Dairy", "Snacks", "Staples"][i]}</div>`).join("")}
          </div>
          <div style="margin:10px 12px;border-radius:10px;height:56px;background:linear-gradient(90deg,#0b1020,#1d2a4a);display:flex;align-items:center;justify-content:space-between;padding:0 14px;color:#fff"><b style="font-size:11px">Flat ₹100 off on first order</b><span style="font-size:8.5px;font-weight:800;background:#ffb547;color:#0b1020;padding:5px 9px;border-radius:999px">FRESH100</span></div>
        </div>
        <span class="frm-l" style="left:40px;top:28px">Home — Desktop</span>
        <div class="sel" style="left:46px;top:94px;width:348px;height:162px">
          <i style="left:-5px;top:-5px"></i><i style="right:-5px;top:-5px"></i><i style="left:-5px;bottom:-5px"></i><i style="right:-5px;bottom:-5px"></i>
          <span class="size" style="left:50%;bottom:-24px;transform:translateX(-50%)">1440 × 640</span>
        </div>
        <span class="frm-l" style="left:432px;top:28px">Home — Mobile</span>
        <div class="frm" style="left:432px;top:46px;width:150px;height:300px;overflow:hidden;border-radius:14px">
          <div style="height:26px;display:flex;align-items:center;padding:0 10px"><b class="sora" style="font-size:9px;color:#15803d">FreshKart</b></div>
          <div style="margin:0 8px;border-radius:10px;height:110px;background:linear-gradient(135deg,#e7f8ec,#d4f0e0);padding:10px;position:relative"><b class="sora" style="font-size:11px;line-height:1.15;display:block;max-width:90px">Groceries in 30 minutes</b><div style="position:absolute;right:10px;bottom:10px;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ffcf6b,#f59e0b)"></div></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:8px">${["#fde7c7", "#dff3ff", "#ffe1e6", "#e9e4ff"].map((c) => `<div style="background:${c};border-radius:8px;height:46px"></div>`).join("")}</div>
          <div style="margin:0 8px;height:28px;border-radius:999px;background:#15803d"></div>
        </div>
        <div class="cur" style="left:300px;top:250px">${`<svg width="18" height="18" viewBox="0 0 24 24" fill="#e8508a" stroke="#fff" stroke-width="1.5"><path d="M4 3l7 18 2.5-7.5L21 11z"/></svg>`}<span style="background:#e8508a">Aditi</span></div>
        <div class="cur" style="left:470px;top:318px">${`<svg width="18" height="18" viewBox="0 0 24 24" fill="#00a1c6" stroke="#fff" stroke-width="1.5"><path d="M4 3l7 18 2.5-7.5L21 11z"/></svg>`}<span style="background:#00a1c6">Rahul</span></div>
        <div style="position:absolute;left:402px;top:372px;width:166px;background:#fff7d6;border-radius:10px;padding:10px;font-size:10.5px;font-weight:700;line-height:1.4;box-shadow:0 8px 18px -10px rgba(0,0,0,.3)"><div class="row" style="gap:6px;margin-bottom:5px">${av("KP", "#7c5cff", 18, 8)}<span style="color:#7a8496">Karan</span></div>Can the CTA say "Order in 30 min"?</div>
      </div>
      <div class="fg-props">
        <div><div class="h">Frame</div><div class="pr"><span><i>X</i>0</span><span><i>Y</i>96</span><span><i>W</i>1440</span><span><i>H</i>640</span></div></div>
        <div><div class="h">Auto layout</div><div class="pr"><span><i>Gap</i>24</span><span><i>Pad</i>48</span></div></div>
        <div><div class="h">Fill</div><span style="display:flex;align-items:center;gap:8px;background:#f3f5f9;border-radius:6px;padding:6px 8px"><i style="width:16px;height:16px;border-radius:4px;background:#e7f8ec;display:block;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)"></i>E7F8EC<span style="margin-left:auto;color:#8a93a4">100%</span></span></div>
        <div><div class="h">Corner radius</div><div class="pr"><span><i>R</i>24</span><span><i>◻</i>All</span></div></div>
        <div><div class="h">Effects</div><span style="display:flex;justify-content:space-between;background:#f3f5f9;border-radius:6px;padding:6px 8px">Drop shadow<i style="font-style:normal;color:#8a93a4">0 12 32</i></span></div>
      </div>
    </div>
  </div>

  <div class="card abs pal" style="border-radius:22px">
    <div class="row" style="justify-content:space-between"><span class="k">Colour system</span><span style="font-size:11px;font-weight:700;color:#7a8496">5 tokens · AA contrast</span></div>
    <div class="pal-row">
      ${swatches.map(([c, n, r]) => `<div><div class="sw" style="background:${c}"></div><div class="sw-l">${n}</div><div class="sw-h">${c}</div><div class="sw-h" style="text-transform:none">${r}</div></div>`).join("")}
    </div>
  </div>

  <div class="card abs ty" style="border-radius:22px">
    <div class="row" style="justify-content:space-between;align-items:flex-start">
      <div><span class="k">Typography</span><div class="big" style="margin-top:10px">Aa</div></div>
      <div class="col" style="gap:4px;text-align:right;margin-top:2px"><b class="sora" style="font-size:16px">Sora</b><span style="font-size:11.5px;color:#7a8496;font-weight:600">Display · 600</span><b style="font-size:16px;margin-top:6px">Manrope</b><span style="font-size:11.5px;color:#7a8496;font-weight:600">Body · 400–800</span></div>
    </div>
    <div class="scale">
      <div><b class="sora" style="font-size:22px;letter-spacing:-.02em">Heading 1</b><i>48 / 56</i></div>
      <div><b class="sora" style="font-size:16px">Heading 2</b><i>32 / 40</i></div>
      <div><span style="font-size:13px;font-weight:500">Body text for product pages</span><i>16 / 26</i></div>
    </div>
  </div>

  <div class="card abs board" style="border-radius:22px">
    <div class="row" style="justify-content:space-between"><div class="row" style="gap:10px"><span class="k">Sprint 14 · Week 2</span><span class="pill" style="font-size:10.5px;padding:3px 9px;background:#e6f6fa;color:#007f9d">Design review Fri</span></div><span class="stack">${av("AS", "#e8508a", 24)}${av("RM", "#00a1c6", 24)}${av("KP", "#7c5cff", 24)}${av("NJ", "#f59e0b", 24)}</span></div>
    <div class="cols">
      <div><h4>To do <i>3</i></h4><div class="sts">${sticky("Hindi + Marathi strings", "#fff1a8", -2, "NJ", "#f59e0b")}${sticky("Empty-cart illustration", "#ffd6e3", 1.5, "AS", "#e8508a")}</div></div>
      <div><h4>Doing <i>2</i></h4><div class="sts">${sticky("Checkout flow prototype", "#cfe9ff", 1, "RM", "#00a1c6")}${sticky("Product card states", "#fff1a8", -1.5, "KP", "#7c5cff")}</div></div>
      <div><h4>Done <i>6</i></h4><div class="sts">${sticky("Moodboard signed off ✓", "#cdf3d9", -1, "AS", "#e8508a")}${sticky("Colour tokens in code ✓", "#cdf3d9", 2, "RM", "#00a1c6")}</div></div>
    </div>
  </div>`;
  return doc(W, H, css, body);
}

function sceneServiceWeb() {
  const W = 1200,
    H = 800;
  const css = `
  body{background:radial-gradient(700px 420px at 50% 30%,rgba(0,161,198,.18),transparent 70%),linear-gradient(180deg,#f7f9fc,#e7eef7)}
  .lap{position:absolute;left:180px;top:62px;width:840px}
  .lid{position:relative;background:#1a1f2b;border-radius:26px 26px 6px 6px;padding:16px 16px 22px;box-shadow:0 0 0 1.5px #3a4153 inset}
  .cam{position:absolute;left:50%;top:6px;width:6px;height:6px;border-radius:50%;background:#3a4153;transform:translateX(-50%)}
  .scr{height:520px;border-radius:8px;overflow:hidden;background:#fff;position:relative}
  .base{position:relative;margin:0 -70px;height:22px;background:linear-gradient(180deg,#d7dce4,#aeb5c1);border-radius:2px 2px 26px 26px;box-shadow:0 30px 50px -20px rgba(11,16,32,.45)}
  .base::before{content:"";position:absolute;left:50%;top:0;width:150px;height:9px;transform:translateX(-50%);background:#9aa2b0;border-radius:0 0 10px 10px}
  .shadow{position:absolute;left:140px;right:140px;top:672px;height:40px;background:radial-gradient(closest-side,rgba(11,16,32,.35),transparent);filter:blur(8px)}
  .pl-nav{display:flex;justify-content:space-between;align-items:center;padding:11px 28px;background:#0b1020;color:#fff}
  .pl-nav .links{display:flex;gap:20px;font-size:11.5px;font-weight:600;color:#aab3c5}
  .pl-hero{position:relative;background:radial-gradient(500px 260px at 82% 40%,rgba(0,161,198,.35),transparent 70%),linear-gradient(120deg,#0b1020,#0d1d3d);color:#fff;padding:22px 28px 24px;display:grid;grid-template-columns:1.1fr 1fr;gap:20px}
  .pl-hero h1{font:600 27px/1.1 Sora;letter-spacing:-.03em}
  .pl-hero p{font-size:12px;line-height:1.6;color:#aab3c5;margin-top:12px;max-width:320px}
  .btn{display:inline-flex;align-items:center;gap:7px;font-size:11.5px;font-weight:800;padding:10px 15px;border-radius:999px}
  .trk{background:rgba(255,255,255,.96);color:#0b1020;border-radius:16px;padding:14px;box-shadow:0 20px 40px -16px rgba(0,0,0,.6)}
  .trk .k{font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7a8496}
  .route{display:flex;align-items:center;gap:8px;margin:10px 0}
  .route b{font-size:15px}.route .ln{flex:1;height:2px;background:repeating-linear-gradient(90deg,#00a1c6 0 6px,transparent 6px 10px);position:relative}
  .route .ln i{position:absolute;left:62%;top:-8px;width:18px;height:18px;border-radius:50%;background:#00a1c6;display:flex;align-items:center;justify-content:center}
  .steps{display:flex;flex-direction:column;gap:7px;font-size:10.5px;font-weight:700}
  .steps div{display:flex;align-items:center;gap:8px}
  .steps i{width:14px;height:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:none}
  .pl-sec{padding:14px 28px 8px}
  .pl-sec h3{font:600 17px Sora;letter-spacing:-.02em}
  .pl-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:10px}
  .pl-card{border:1px solid #edf0f5;border-radius:14px;padding:11px 13px;background:#fbfcfe;display:grid;grid-template-columns:30px 1fr;column-gap:10px;align-items:center}
  .pl-card b{display:block;font-size:12.5px}.pl-card .ic{grid-row:span 2}.pl-card span{font-size:10.5px;color:#7a8496;font-weight:600;line-height:1.45}
  .ic{width:30px;height:30px;border-radius:9px;background:#e8f1fa;display:flex;align-items:center;justify-content:center}
  .pl-cta{margin:6px 28px;border-radius:16px;padding:13px 20px;background:linear-gradient(120deg,#00a1c6,#0061a8);color:#fff;display:flex;justify-content:space-between;align-items:center}
  .fl{position:absolute;background:#fff;border-radius:18px;box-shadow:0 24px 50px -18px rgba(11,16,32,.35);padding:14px 16px}
  .k2{font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7a8496}
  `;
  const body = `
  <div class="shadow"></div>
  <div class="lap">
    <div class="lid"><span class="cam"></span>
      <div class="scr">
        ${chrome("patellogistics.in").replace('class="bar"', 'class="bar" style="height:32px"')}
        <div class="pl-nav"><div class="row" style="gap:8px"><span style="width:24px;height:24px;border-radius:7px;background:linear-gradient(135deg,#00a1c6,#0061a8);display:flex;align-items:center;justify-content:center">${I("truck", 14, "#fff", 2.2)}</span><b class="sora" style="font-size:13.5px">Patel Logistics</b></div><div class="links"><span style="color:#fff">Home</span><span>Services</span><span>Network</span><span>Track</span><span>Careers</span></div><span class="btn" style="background:#fff;color:#0b1020;padding:8px 13px">Get a quote</span></div>
        <div class="pl-hero">
          <div>
            <span class="pill" style="font-size:10px;padding:5px 10px;background:rgba(0,161,198,.18);color:#5fd7f2">${I("zap", 11, "#5fd7f2", 2.4)} 140+ cities across India</span>
            <h1 style="margin-top:12px">Freight that arrives when we said it would.</h1>
            <p>Full-truck and part-load transport, warehousing and live tracking — booked online in under two minutes.</p>
            <div class="row" style="gap:9px;margin-top:16px"><span class="btn" style="background:linear-gradient(135deg,#00a1c6,#0061a8);color:#fff">Book a shipment ${I("arrow", 12, "#fff", 2.6)}</span><span class="btn" style="border:1.5px solid rgba(255,255,255,.25);color:#fff">Track order</span></div>
          </div>
          <div class="trk">
            <div class="row" style="justify-content:space-between"><span class="k">Shipment #PL-48213</span><span class="pill" style="font-size:9.5px;padding:3px 8px;background:#e6f6fa;color:#007f9d">In transit</span></div>
            <div class="route"><b>Pune</b><span class="ln"><i>${I("truck", 10, "#fff", 2.4)}</i></span><b>Nagpur</b></div>
            <div class="steps">
              <div><i style="background:#16a34a">${I("check", 9, "#fff", 3.5)}</i>Picked up · Hadapsar<span style="margin-left:auto;color:#7a8496">06:10</span></div>
              <div><i style="background:#16a34a">${I("check", 9, "#fff", 3.5)}</i>Crossed Aurangabad<span style="margin-left:auto;color:#7a8496">11:42</span></div>
              <div><i style="background:#e6f6fa;box-shadow:inset 0 0 0 2px #00a1c6"></i>Arriving · ETA 19:30<span style="margin-left:auto;color:#007f9d">On time</span></div>
            </div>
          </div>
        </div>
        <div class="pl-sec">
          <div class="row" style="justify-content:space-between"><h3>What we move</h3><span style="font-size:11px;font-weight:800;color:#0061a8">All services →</span></div>
          <div class="pl-cards">
            <div class="pl-card"><span class="ic">${I("truck", 16, "#0061a8")}</span><b>Full truckload</b><span>14–32 ft trucks, GPS-tracked</span></div>
            <div class="pl-card"><span class="ic">${I("box", 16, "#0061a8")}</span><b>Part load</b><span>Pay per kg, from 250 kg</span></div>
            <div class="pl-card"><span class="ic">${I("database", 16, "#0061a8")}</span><b>Warehousing</b><span>Bhiwandi & Chakan hubs</span></div>
          </div>
        </div>
        <div class="pl-cta"><div><b class="sora" style="font-size:15px">Ship your first load this week</b><div style="font-size:11px;color:rgba(255,255,255,.8);font-weight:600;margin-top:2px">Transparent per-km pricing · GST invoice included</div></div><span class="btn" style="background:#fff;color:#0061a8">Get instant quote</span></div>
      </div>
    </div>
    <div class="base"></div>
  </div>
  <div class="fl" style="left:22px;top:300px;width:180px">
    <span class="k2">Enquiries this week</span>
    <div class="row" style="justify-content:space-between;margin-top:6px"><b class="sora" style="font-size:26px">48</b><span class="pill" style="font-size:10.5px;padding:3px 8px;background:#e8f8ee;color:#15803d">${I("trend", 11, "#15803d", 2.6)} 22%</span></div>
    <svg width="148" height="40" viewBox="0 0 148 40" style="margin-top:6px">${areaChart({ values: [12, 16, 14, 22, 20, 30, 34], w: 148, h: 40, color: C.cyan, id: "sw1", strokeW: 2.5 })}</svg>
  </div>
  <div class="fl" style="left:964px;top:420px;width:214px;display:flex;gap:12px;align-items:center">
    <span style="width:40px;height:40px;border-radius:12px;background:#e8f8ee;display:flex;align-items:center;justify-content:center">${I("phone", 18, "#15803d")}</span>
    <div class="col" style="gap:2px"><b style="font-size:13px">Mobile-first</b><span style="font-size:11px;color:#5d6779;font-weight:600">Responsive on every screen</span></div>
  </div>`;
  return doc(W, H, css, body);
}

function sceneCloud() {
  const W = 900,
    H = 700;
  const rt = [190, 182, 176, 171, 169, 174, 188, 205, 231, 246, 238, 222, 214, 209, 226, 241, 233, 218, 201, 192, 186, 180, 178, 182];
  const bars = Array.from({ length: 60 }, (_, i) => (i === 23 ? "#f59e0b" : i === 41 ? "#86d9a2" : "#22c55e"));
  const css = `
  body{background:radial-gradient(520px 380px at 85% 10%,rgba(0,161,198,.2),transparent 70%),radial-gradient(500px 380px at 0% 100%,rgba(0,97,168,.14),transparent 70%),linear-gradient(160deg,#f7f9fc,#e8eff8)}
  .dash{left:44px;top:72px;width:812px;border-radius:24px;padding:24px;display:flex;flex-direction:column;gap:16px}
  .k{font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7a8496}
  .tile{border:1px solid #edf0f5;border-radius:18px;padding:16px;background:#fbfcfe}
  .mini{display:flex;gap:12px;align-items:flex-start}
  .mi{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex:none}
  `;
  const w = 470,
    h = 150;
  const [px, py] = chartPoint(rt, w, h, 120, 280, 9, 0);
  const body = `
  <div class="card abs dash">
    <div class="row" style="justify-content:space-between">
      <div class="row" style="gap:12px"><span class="mi" style="background:linear-gradient(135deg,#00a1c6,#0061a8)">${I("server", 18, "#fff")}</span><div class="col" style="gap:2px"><b class="sora" style="font-size:17px;letter-spacing:-.01em">sharmainteriors.in</b><span style="font-size:11.5px;color:#7a8496;font-weight:600">Production · Mumbai (ap-south-1) · Node 22</span></div></div>
      <span class="pill" style="font-size:11.5px;padding:7px 12px;background:#e8f8ee;color:#15803d"><i style="width:7px;height:7px;border-radius:50%;background:#16a34a;display:block;box-shadow:0 0 0 4px rgba(22,163,74,.18)"></i>All systems operational</span>
    </div>
    <div style="display:grid;grid-template-columns:250px 1fr;gap:16px">
      <div class="tile" style="background:linear-gradient(160deg,#0b1020,#13264a);border:none;color:#fff">
        <span class="k" style="color:#8fa3c4">Uptime · 60 days</span>
        <div class="sora" style="font-size:44px;font-weight:600;letter-spacing:-.03em;margin-top:8px">99.98<span style="font-size:24px;color:#5fd7f2">%</span></div>
        <div style="font-size:11.5px;color:#a9b7cf;font-weight:600;margin-top:2px">1 incident · 9 min total</div>
        <div style="display:flex;gap:2px;margin-top:18px;height:34px;align-items:stretch">${bars.map((c) => `<i style="flex:1;background:${c};border-radius:2px;display:block"></i>`).join("")}</div>
        <div class="row" style="justify-content:space-between;font-size:10px;color:#8fa3c4;font-weight:700;margin-top:6px"><span>60 days ago</span><span>Today</span></div>
      </div>
      <div class="tile">
        <div class="row" style="justify-content:space-between"><div><span class="k">Response time · 24 h</span><div class="row" style="gap:8px;margin-top:6px"><b class="sora" style="font-size:26px">182<span style="font-size:14px;color:#7a8496"> ms</span></b><span class="pill" style="font-size:10.5px;padding:3px 8px;background:#e8f8ee;color:#15803d">p95 246 ms</span></div></div>
        <div class="row" style="gap:6px;font-size:10.5px;font-weight:700"><span style="padding:5px 9px;border-radius:8px;background:#0b1020;color:#fff">24h</span><span style="padding:5px 9px;color:#7a8496">7d</span><span style="padding:5px 9px;color:#7a8496">30d</span></div></div>
        <svg width="${w}" height="${h + 22}" viewBox="0 0 ${w} ${h + 22}" style="margin-top:8px;overflow:visible">
          ${[0, 1, 2, 3].map((i) => `<line x1="0" x2="${w}" y1="${(i * h) / 3}" y2="${(i * h) / 3}" stroke="#eef1f5" stroke-dasharray="3 4"/>`).join("")}
          ${areaChart({ values: rt, w, h, min: 120, max: 280, color: C.cyan, id: "rt", padTop: 0 })}
          <line x1="${px}" x2="${px}" y1="${py}" y2="${h}" stroke="#00a1c6" stroke-dasharray="3 3"/>
          <circle cx="${px}" cy="${py}" r="5.5" fill="#fff" stroke="#00a1c6" stroke-width="3"/>
          <g transform="translate(${px - 44},${py - 40})"><rect width="88" height="28" rx="8" fill="#0b1020"/><text x="44" y="18" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="11" fill="#fff">09:00 · 246 ms</text></g>
          ${["00:00", "06:00", "12:00", "18:00", "Now"].map((t, i) => `<text x="${(i * w) / 4}" y="${h + 18}" text-anchor="${i === 0 ? "start" : i === 4 ? "end" : "middle"}" font-family="Manrope" font-weight="700" font-size="10.5" fill="#8a93a4">${t}</text>`).join("")}
        </svg>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
      <div class="tile mini"><span class="mi" style="background:#e8f8ee">${I("shield", 18, "#15803d")}</span><div class="col" style="gap:3px"><span class="k">SSL certificate</span><b style="font-size:14px">Valid · A+</b><span style="font-size:11.5px;color:#5d6779;font-weight:600">Auto-renews in 64 days</span></div></div>
      <div class="tile mini"><span class="mi" style="background:#e8f1fa">${I("database", 18, "#0061a8")}</span><div class="col" style="gap:3px"><span class="k">Backups</span><b style="font-size:14px">Daily · 02:00 IST</b><span style="font-size:11.5px;color:#5d6779;font-weight:600">30 snapshots retained</span></div></div>
      <div class="tile mini"><span class="mi" style="background:#e6f6fa">${I("activity", 18, "#007f9d")}</span><div class="col" style="gap:3px;flex:1"><span class="k">Server load</span><b style="font-size:14px">CPU 31% · RAM 2.1 GB</b><span style="display:block;height:6px;border-radius:9px;background:#eef1f5;margin-top:5px;overflow:hidden"><i style="display:block;width:31%;height:100%;background:linear-gradient(90deg,#00a1c6,#0061a8)"></i></span></div></div>
    </div>
    <div class="tile" style="padding:12px 16px;display:flex;align-items:center;gap:12px;font-size:12px;font-weight:700">
      ${I("refresh", 16, "#0061a8")}<span>Deploy <span style="color:#7a8496">#218</span> · “Update festive offers banner”</span>
      <span style="color:#7a8496;font-weight:600">by Rahul M. · 14 min ago</span>
      <span class="pill" style="margin-left:auto;font-size:10.5px;padding:4px 9px;background:#e8f8ee;color:#15803d">${I("check", 11, "#15803d", 3)} Live in 38 s</span>
    </div>
  </div>`;
  return doc(W, H, css, body);
}

function sceneCaseStudy() {
  const W = 1000,
    H = 800;
  const cur = [9.8, 10.6, 11.2, 10.9, 12.4, 13.1, 12.8, 14.6, 15.2, 16.1, 17.0, 18.4];
  const prev = [7.9, 8.4, 8.8, 8.6, 9.5, 10.1, 9.9, 10.8, 11.6, 12.0, 12.9, 13.6];
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const w = 500,
    h = 262;
  const [px, py] = chartPoint(cur, w, h, 6, 20, 11, 0);
  const kpi = (label, val, delta, ic, up = true) => `
    <div class="kpi"><div class="row" style="justify-content:space-between"><span class="k">${label}</span><span class="ki">${I(ic, 14, "#5fd7f2")}</span></div>
    <b class="sora">${val}</b><span class="d" style="color:${up ? "#4ade80" : "#fb7185"}">${I("trend", 11, up ? "#4ade80" : "#fb7185", 2.6)} ${delta} <span style="color:#8090ab;font-weight:600">vs last month</span></span></div>`;
  const css = `
  body{background:radial-gradient(600px 420px at 70% 20%,rgba(0,161,198,.25),transparent 70%),linear-gradient(150deg,#071022,#0b1a36 60%,#0b2a4a)}
  .app{left:48px;top:56px;width:904px;height:688px;border-radius:24px;background:rgba(13,21,42,.92);border:1px solid rgba(255,255,255,.08);box-shadow:0 50px 100px -30px rgba(0,0,0,.7);display:grid;grid-template-columns:64px 1fr;overflow:hidden;color:#e7ecf5}
  .side{border-right:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px 0}
  .si{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center}
  .si.on{background:rgba(0,161,198,.18)}
  .main{padding:22px 24px;display:flex;flex-direction:column;gap:16px;min-width:0}
  .k{font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#8090ab}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  .kpi{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:6px}
  .kpi b{font-size:24px;font-weight:600;letter-spacing:-.02em;color:#fff}
  .kpi .d{font-size:11px;font-weight:800;display:flex;align-items:center;gap:4px}
  .ki{width:26px;height:26px;border-radius:8px;background:rgba(0,161,198,.14);display:flex;align-items:center;justify-content:center}
  .panel{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:16px 18px}
  .lg{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#a9b7cf}
  .lg i{width:14px;height:3px;border-radius:2px;display:block}
  .prod{display:flex;align-items:center;gap:10px;font-size:12px;font-weight:700;padding:7px 0;border-top:1px solid rgba(255,255,255,.06)}
  .prod:first-of-type{border-top:none}
  .pi{width:30px;height:30px;border-radius:9px;flex:none}
  `;
  const body = `
  <div class="abs app">
    <div class="side">
      <span class="si" style="background:linear-gradient(135deg,#00a1c6,#0061a8);margin-bottom:12px"><b class="sora" style="font-size:15px;color:#fff">F</b></span>
      <span class="si on">${I("bars", 18, "#5fd7f2")}</span>
      <span class="si">${I("cart", 18, "#6b7a95")}</span>
      <span class="si">${I("box", 18, "#6b7a95")}</span>
      <span class="si">${I("user", 18, "#6b7a95")}</span>
      <span class="si">${I("sliders", 18, "#6b7a95")}</span>
    </div>
    <div class="main">
      <div class="row" style="justify-content:space-between">
        <div><span class="k">FreshKart · Admin</span><div class="sora" style="font-size:22px;font-weight:600;letter-spacing:-.02em;margin-top:4px;color:#fff">Sales overview</div></div>
        <div class="row" style="gap:10px"><span class="pill" style="font-size:11.5px;padding:8px 12px;background:rgba(255,255,255,.06);color:#c9d3e4">${I("calendar", 13, "#c9d3e4")} Nov 2025 – Oct 2026</span>${av("SM", "linear-gradient(135deg,#f59e0b,#e8508a)", 34)}</div>
      </div>
      <div class="kpis">
        ${kpi("Revenue", "₹18.4L", "8.2%", "trend")}
        ${kpi("Orders", "2,318", "5.6%", "cart")}
        ${kpi("Avg order", "₹794", "2.4%", "box")}
        ${kpi("Conversion", "3.8%", "0.4 pt", "zap")}
      </div>
      <div style="display:grid;grid-template-columns:1fr 228px;gap:12px;flex:1;min-height:0">
        <div class="panel">
          <div class="row" style="justify-content:space-between"><div><span class="k">Monthly revenue</span><div class="row" style="gap:10px;margin-top:6px"><b class="sora" style="font-size:22px;color:#fff">₹1.62 Cr</b><span style="font-size:11px;font-weight:700;color:#8090ab">last 12 months</span></div></div>
          <div class="row" style="gap:14px"><span class="lg"><i style="background:#00a1c6"></i>This year</span><span class="lg"><i style="background:#6b7a95"></i>Last year</span></div></div>
          <svg width="${w}" height="${h + 24}" viewBox="0 0 ${w} ${h + 24}" style="margin-top:14px;overflow:visible">
            ${[0, 1, 2, 3, 4].map((i) => `<line x1="0" x2="${w}" y1="${(i * h) / 4}" y2="${(i * h) / 4}" stroke="rgba(255,255,255,.06)"/>`).join("")}
            ${areaChart({ values: prev, w, h, min: 6, max: 20, color: "#6b7a95", id: "pv", strokeW: 2, fillOpacity: 0, padTop: 0, dash: "5 5" })}
            ${areaChart({ values: cur, w, h, min: 6, max: 20, color: C.cyan, id: "cr", strokeW: 3, fillOpacity: 0.35, padTop: 0 })}
            <circle cx="${px}" cy="${py}" r="11" fill="rgba(0,161,198,.25)"/><circle cx="${px}" cy="${py}" r="5.5" fill="#fff" stroke="#00a1c6" stroke-width="3"/>
            <g transform="translate(${px - 112},${py - 18})"><rect width="96" height="44" rx="10" fill="#fff"/><text x="12" y="18" font-family="Manrope" font-weight="700" font-size="10" fill="#7a8496">October</text><text x="12" y="35" font-family="Sora" font-weight="600" font-size="15" fill="#0b1020">₹18.4L</text></g>
            ${months.map((m, i) => `<text x="${(i * w) / 11}" y="${h + 20}" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="10.5" fill="#6b7a95">${m}</text>`).join("")}
          </svg>
        </div>
        <div class="panel" style="display:flex;flex-direction:column">
          <span class="k">Sales by channel</span>
          <svg width="190" height="130" viewBox="0 0 190 130" style="margin:12px auto 4px">
            ${(() => {
              const r = 48,
                cx = 95,
                cy = 64,
                circ = 2 * Math.PI * r;
              const seg = [
                [0.54, "#00a1c6"],
                [0.31, "#0061a8"],
                [0.15, "#f59e0b"],
              ];
              let off = 0;
              return (
                seg
                  .map(([f, c]) => {
                    const s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="16" stroke-dasharray="${(f * circ - 3).toFixed(1)} ${circ.toFixed(1)}" stroke-dashoffset="${(-off * circ).toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
                    off += f;
                    return s;
                  })
                  .join("") +
                `<text x="${cx}" y="${cy - 2}" text-anchor="middle" font-family="Sora" font-weight="600" font-size="18" fill="#fff">2,318</text><text x="${cx}" y="${cy + 15}" text-anchor="middle" font-family="Manrope" font-weight="700" font-size="10" fill="#8090ab">orders</text>`
              );
            })()}
          </svg>
          <div class="col" style="gap:7px;font-size:11.5px;font-weight:700;color:#c9d3e4">
            <div class="row" style="gap:8px"><i style="width:8px;height:8px;border-radius:3px;background:#00a1c6;display:block"></i>Mobile app<span style="margin-left:auto;color:#fff">54%</span></div>
            <div class="row" style="gap:8px"><i style="width:8px;height:8px;border-radius:3px;background:#0061a8;display:block"></i>Website<span style="margin-left:auto;color:#fff">31%</span></div>
            <div class="row" style="gap:8px"><i style="width:8px;height:8px;border-radius:3px;background:#f59e0b;display:block"></i>WhatsApp orders<span style="margin-left:auto;color:#fff">15%</span></div>
          </div>
          <div style="margin-top:auto;padding-top:12px;border-top:1px solid rgba(255,255,255,.06)">
            <span class="k">Top product</span>
            <div class="prod" style="padding-bottom:0"><span class="pi" style="background:radial-gradient(circle at 35% 35%,#ffcf6b,#f59e0b)"></span><div class="col" style="gap:1px"><span>Alphonso mangoes</span><span style="font-size:10.5px;color:#8090ab">1 dozen · ₹649</span></div><span style="margin-left:auto;color:#4ade80;font-size:11px">412 sold</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  return doc(W, H, css, body);
}

function sceneMedicare() {
  const W = 900,
    H = 1000;
  const doctors = [
    ["AR", "#00a1c6", "Dr. Ananya Rao", "Cardiologist · 14 yrs", "4.9", "₹800", "Today 4:30 PM"],
    ["VS", "#7c5cff", "Dr. Vikram Singh", "Dermatologist · 9 yrs", "4.8", "₹600", "Today 6:00 PM"],
    ["PN", "#e8508a", "Dr. Priya Nair", "Paediatrician · 11 yrs", "4.9", "₹700", "Tomorrow 10 AM"],
    ["MK", "#f59e0b", "Dr. Mohit Kapoor", "Orthopaedic · 16 yrs", "4.7", "₹900", "Tomorrow 12 PM"],
  ];
  const dates = [
    ["Mon", "2"],
    ["Tue", "3"],
    ["Wed", "4"],
    ["Thu", "5"],
    ["Fri", "6"],
  ];
  const slots = ["09:30", "10:00", "10:30", "11:30", "12:00", "04:00", "04:30", "05:00", "05:30"];
  const css = `
  body{background:radial-gradient(520px 420px at 30% 25%,rgba(255,255,255,.75),transparent 70%),radial-gradient(500px 420px at 85% 85%,rgba(0,161,198,.28),transparent 70%),linear-gradient(160deg,#dfe8ea,#b9cdd2)}
  .p1{left:96px;top:140px;width:340px;height:700px;transform:rotate(-5deg)}
  .p2{left:466px;top:178px;width:340px;height:700px;transform:rotate(4deg)}
  .scr-pad{padding:4px 18px 0}
  .k{font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7a8496}
  .srch{display:flex;align-items:center;gap:8px;height:40px;border-radius:12px;background:#f2f5f9;padding:0 12px;font-size:12px;font-weight:600;color:#8a93a4;margin-top:12px}
  .cats{display:flex;gap:8px;margin-top:12px}
  .cat{flex:1;border-radius:14px;padding:9px 4px;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:9.5px;font-weight:800;background:#f5f8fb}
  .cat.on{background:#0061a8;color:#fff}
  .doc{display:flex;gap:10px;align-items:center;padding:10px;border-radius:16px;border:1px solid #eef1f5;margin-top:9px;background:#fff}
  .doc .meta{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}
  .doc b{font-size:12.5px}.doc span{font-size:10.5px;color:#7a8496;font-weight:600}
  .nav{position:absolute;left:0;right:0;bottom:0;height:62px;border-top:1px solid #eef1f5;display:flex;justify-content:space-around;align-items:center;background:#fff;padding-bottom:6px}
  .nav span{display:flex;flex-direction:column;align-items:center;gap:3px;font-size:9px;font-weight:800;color:#9aa3b2}
  .nav span.on{color:#0061a8}
  .hdr{background:linear-gradient(160deg,#0061a8,#00a1c6);color:#fff;padding:0 18px 22px;margin-top:-44px;padding-top:52px;border-radius:0 0 28px 28px}
  .dates{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:10px}
  .dt{border-radius:14px;padding:9px 0;text-align:center;border:1px solid #eef1f5;display:flex;flex-direction:column;gap:2px}
  .dt span{font-size:9.5px;font-weight:700;color:#7a8496}.dt b{font:600 16px Sora}
  .dt.on{background:#0b1020;border-color:#0b1020;color:#fff}.dt.on span{color:#9fb0cc}
  .slots{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}
  .sl{height:34px;border-radius:10px;border:1px solid #e5eaf1;display:flex;align-items:center;justify-content:center;font-size:11.5px;font-weight:800}
  .sl.off{color:#c3c9d3;background:#f7f9fb;text-decoration:line-through}
  .sl.on{background:#e6f6fa;border-color:#00a1c6;color:#007f9d;box-shadow:inset 0 0 0 1px #00a1c6}
  .confirm{position:absolute;left:16px;right:16px;bottom:18px;height:50px;border-radius:16px;background:linear-gradient(135deg,#00a1c6,#0061a8);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:13px;font-weight:800;box-shadow:0 14px 26px -12px rgba(0,97,168,.7)}
  .badge{position:absolute;z-index:6;background:#fff;border-radius:18px;padding:12px 14px;box-shadow:0 24px 48px -18px rgba(11,16,32,.45);display:flex;gap:10px;align-items:center}
  `;
  const list = `
    <div class="scr-pad">
      <div class="row" style="justify-content:space-between;margin-top:4px"><div><span style="font-size:11.5px;color:#7a8496;font-weight:600">Good evening,</span><div class="sora" style="font-size:19px;font-weight:600;letter-spacing:-.02em">Meera Iyer</div></div><span style="position:relative;width:38px;height:38px;border-radius:12px;background:#f2f5f9;display:flex;align-items:center;justify-content:center">${I("bell", 17, "#0b1020")}<i style="position:absolute;top:9px;right:10px;width:7px;height:7px;border-radius:50%;background:#e8508a;box-shadow:0 0 0 2px #f2f5f9"></i></span></div>
      <div class="srch">${I("search", 15, "#8a93a4")}Search doctors, clinics…</div>
      <div class="cats">
        <span class="cat on">${I("heart", 17, "#fff")}Heart</span>
        <span class="cat">${I("eye", 17, "#0061a8")}Eyes</span>
        <span class="cat">${I("tooth", 17, "#0061a8")}Dental</span>
        <span class="cat">${I("baby", 17, "#0061a8")}Child</span>
      </div>
      <div class="row" style="justify-content:space-between;margin-top:16px"><b style="font-size:13.5px">Available near you</b><span style="font-size:11px;font-weight:800;color:#0061a8">See all</span></div>
      ${doctors
        .map(
          ([ini, c, n, s, r, fee, next], i) => `<div class="doc" ${i === 0 ? 'style="border-color:#bfe7f1;box-shadow:0 10px 22px -14px rgba(0,97,168,.45)"' : ""}>${av(ini, c, 42)}<div class="meta"><b>${n}</b><span>${s}</span><span style="color:${i < 2 ? "#15803d" : "#7a8496"}">${I("clock", 10, i < 2 ? "#15803d" : "#7a8496", 2.4).replace("flex:none", "flex:none;vertical-align:-1px")} ${next}</span></div><div class="col" style="align-items:flex-end;gap:4px"><span class="row" style="gap:3px;font-size:11px;font-weight:800;color:#0b1020">${STAR(11)}${r}</span><b style="font-size:12px">${fee}</b></div></div>`,
        )
        .join("")}
    </div>
    <div class="nav"><span class="on">${I("home", 19, "#0061a8")}Home</span><span>${I("calendar", 19, "#9aa3b2")}Visits</span><span>${I("msg", 19, "#9aa3b2")}Chat</span><span>${I("user", 19, "#9aa3b2")}Profile</span></div>`;
  const picker = `
    <div class="hdr" style="color:#fff">
      <div style="height:44px"></div>
      <div class="row" style="justify-content:space-between">${`<span style="width:34px;height:34px;border-radius:11px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center">${I("left", 17, "#fff", 2.4)}</span>`}<b style="font-size:13px">Book appointment</b><span style="width:34px;height:34px;border-radius:11px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center">${I("heart", 15, "#fff", 2.4)}</span></div>
      <div class="row" style="gap:12px;margin-top:16px">${av("AR", "rgba(255,255,255,.25)", 54, 18)}<div class="col" style="gap:3px"><b class="sora" style="font-size:17px">Dr. Ananya Rao</b><span style="font-size:11.5px;font-weight:600;opacity:.85">Cardiologist · Koregaon Park</span><span class="row" style="gap:4px;font-size:11px;font-weight:800">${STAR(11, "#ffd34d")} 4.9 <span style="opacity:.75;font-weight:600">(312 reviews)</span></span></div></div>
    </div>
    <div class="scr-pad" style="padding-top:14px">
      <div class="row" style="justify-content:space-between"><b style="font-size:13px">November 2026</b><span class="row" style="gap:6px">${I("left", 15, "#9aa3b2", 2.4)}${I("right", 15, "#0b1020", 2.4)}</span></div>
      <div class="dates">${dates.map(([d, n], i) => `<div class="dt ${i === 1 ? "on" : ""}"><span>${d}</span><b>${n}</b></div>`).join("")}</div>
      <div class="row" style="justify-content:space-between;margin-top:14px"><b style="font-size:13px">Available slots</b><span style="font-size:10.5px;font-weight:700;color:#7a8496">In-clinic · 20 min</span></div>
      <div class="slots">${slots.map((s, i) => `<span class="sl ${i === 6 ? "on" : i === 1 || i === 3 ? "off" : ""}">${s}${i < 5 ? " AM" : " PM"}</span>`).join("")}</div>
      <div class="row" style="gap:10px;margin-top:12px;padding:10px 12px;border-radius:14px;background:#f5f8fb;font-size:11px;font-weight:700"><span style="width:30px;height:30px;border-radius:9px;background:#e6f6fa;display:flex;align-items:center;justify-content:center">${I("video", 15, "#007f9d")}</span><div class="col" style="gap:1px"><span>Prefer a video consult?</span><span style="color:#7a8496;font-weight:600">From ₹500 · within 2 hours</span></div></div>
    </div>
    <div class="confirm"><span>Confirm · Tue 3, 4:30 PM</span><span>₹800</span></div>`;
  const body = `
  ${phone(list, "p1")}
  ${phone(picker, "p2").replace('<div class="status">', '<div class="status" style="color:#fff">')}
  <div class="badge" style="left:600px;top:110px;transform:rotate(3deg)"><span style="width:36px;height:36px;border-radius:12px;background:#e8f8ee;display:flex;align-items:center;justify-content:center">${I("check", 18, "#15803d", 3)}</span><div class="col" style="gap:2px"><b style="font-size:12.5px">Appointment confirmed</b><span style="font-size:11px;color:#5d6779;font-weight:600">Reminder sent on WhatsApp</span></div></div>
  <div class="badge" style="left:60px;top:800px;transform:rotate(-3deg)"><span style="width:36px;height:36px;border-radius:12px;background:#e6f6fa;display:flex;align-items:center;justify-content:center">${I("calendar", 17, "#007f9d")}</span><div class="col" style="gap:2px"><b style="font-size:12.5px">6 slots left today</b><span style="font-size:11px;color:#5d6779;font-weight:600">Koregaon Park clinic</span></div></div>`;
  return doc(W, H, css, body);
}

function sceneSkills() {
  const W = 1400,
    H = 900;
  const people = {
    AS: "#e8508a",
    RM: "#00a1c6",
    KP: "#7c5cff",
    NJ: "#f59e0b",
    VD: "#16a34a",
  };
  const tag = (t, bg, fg) => `<span class="tag" style="background:${bg};color:${fg}">${t}</span>`;
  const task = (t, tg, who, meta, extra = "") =>
    `<div class="task" ${extra}><div class="row" style="gap:6px;flex-wrap:wrap">${tg}</div><b>${t}</b><div class="row" style="justify-content:space-between"><span class="meta">${meta}</span><span class="stack">${who.map((w) => av(w, people[w], 24, 9)).join("")}</span></div></div>`;
  const T = {
    fe: tag("Frontend", "#e6f6fa", "#007f9d"),
    be: tag("Backend", "#efeaff", "#6d4fe0"),
    ux: tag("UI/UX", "#ffe7f0", "#c2366f"),
    seo: tag("SEO", "#fff3dc", "#b46c00"),
    qa: tag("QA", "#e8f8ee", "#15803d"),
    hi: tag("High", "#fde8e8", "#c0392b"),
  };
  const col = (name, n, dot, tasks) => `<div class="kcol"><div class="kh"><span class="row" style="gap:8px"><i style="width:8px;height:8px;border-radius:50%;background:${dot};display:block"></i>${name}</span><span class="cnt">${n}</span></div>${tasks}</div>`;
  const burnIdeal = [42, 0];
  const burnAct = [42, 40, 37, 35, 30, 28, 24, 21, 17];
  const bw = 300,
    bh = 110;
  const css = `
  body{background:radial-gradient(700px 500px at 90% 20%,rgba(0,161,198,.2),transparent 70%),radial-gradient(600px 500px at 10% 100%,rgba(0,97,168,.14),transparent 70%),linear-gradient(160deg,#f7f9fc,#e7eef7)}
  .board{left:48px;top:56px;width:1060px;height:788px;border-radius:24px;padding:24px 26px;display:flex;flex-direction:column;gap:18px}
  .k{font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7a8496}
  .cols{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;flex:1;min-height:0}
  .kcol{background:#f5f7fb;border-radius:18px;padding:12px;display:flex;flex-direction:column;gap:10px}
  .kh{display:flex;justify-content:space-between;align-items:center;font-size:12.5px;font-weight:800;padding:2px 4px}
  .cnt{font-size:11px;background:#fff;border-radius:999px;padding:2px 9px;color:#5d6779}
  .task{background:#fff;border-radius:14px;padding:12px;display:flex;flex-direction:column;gap:9px;box-shadow:0 1px 2px rgba(11,16,32,.06),0 6px 14px -10px rgba(11,16,32,.2)}
  .task b{font-size:13px;line-height:1.35}
  .tag{font-size:10px;font-weight:800;padding:3px 8px;border-radius:999px}
  .meta{font-size:10.5px;font-weight:700;color:#8a93a4;display:flex;align-items:center;gap:4px}
  .prog{height:6px;border-radius:9px;background:#eef1f5;overflow:hidden}
  .prog i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,#00a1c6,#0061a8)}
  .fl{position:absolute;border-radius:22px;background:#fff;box-shadow:0 2px 4px rgba(11,16,32,.05),0 40px 70px -26px rgba(11,16,32,.45)}
  .note{display:flex;gap:10px;padding:10px 0;border-top:1px solid #eef1f5}
  .note:first-of-type{border-top:none}
  .note p{font-size:12px;line-height:1.45;font-weight:600;color:#3d4556}
  .note b{font-size:12px}
  `;
  const body = `
  <div class="card abs board">
    <div class="row" style="justify-content:space-between">
      <div><span class="k">FreshKart · Mobile app v2</span><div class="sora" style="font-size:24px;font-weight:600;letter-spacing:-.02em;margin-top:4px">Sprint 14 board</div></div>
      <div class="row" style="gap:16px">
        <div style="width:220px"><div class="row" style="justify-content:space-between;font-size:11.5px;font-weight:800;margin-bottom:6px"><span>Sprint progress</span><span style="color:#0061a8">68%</span></div><div class="prog"><i style="width:68%"></i></div><div style="font-size:10.5px;font-weight:700;color:#8a93a4;margin-top:5px">25 of 37 points · 4 days left</div></div>
        <span class="stack">${Object.entries(people).map(([k, c]) => av(k, c, 34)).join("")}</span>
        <span class="pill" style="font-size:12px;padding:9px 14px;background:#0b1020;color:#fff">${I("plus", 13, "#fff", 2.6)} New task</span>
      </div>
    </div>
    <div class="cols">
      ${col(
        "Backlog",
        6,
        "#9aa3b2",
        task("Wishlist sync across devices", T.be, ["VD"], `${I("clock", 11, "#8a93a4", 2.4)} 5 pts`) +
          task("Product schema for category pages", T.seo, ["NJ"], `${I("clock", 11, "#8a93a4", 2.4)} 3 pts`) +
          task("Referral screen illustrations", T.ux, ["AS"], `${I("clock", 11, "#8a93a4", 2.4)} 2 pts`) +
          task("GST invoice PDF template", T.be, ["RM"], `${I("clock", 11, "#8a93a4", 2.4)} 3 pts`),
      )}
      ${col(
        "In progress",
        4,
        "#00a1c6",
        task("UPI checkout with retry flow", T.fe + T.hi, ["RM", "VD"], `${I("calendar", 11, "#8a93a4", 2.4)} Due Wed`, 'style="box-shadow:0 0 0 2px #00a1c6,0 12px 24px -14px rgba(0,97,168,.5)"') +
          task("Delivery-slot picker", T.ux, ["AS", "KP"], `${I("msg", 11, "#8a93a4", 2.4)} 6 comments`) +
          task("Order status push notifications", T.be, ["VD"], `${I("calendar", 11, "#8a93a4", 2.4)} Due Fri`) +
          `<div class="task" style="gap:7px"><b>Image CDN migration</b><div class="prog"><i style="width:60%"></i></div><span class="meta">3 of 5 subtasks</span></div>`,
      )}
      ${col(
        "In review",
        3,
        "#7c5cff",
        task("Cart page performance pass", T.fe, ["KP"], `${I("zap", 11, "#8a93a4", 2.4)} LCP 1.2 s`) +
          task("Address autocomplete API", T.be, ["RM"], `${I("msg", 11, "#8a93a4", 2.4)} 2 comments`) +
          task("Hindi & Marathi copy", T.ux, ["NJ", "AS"], `${I("globe", 11, "#8a93a4", 2.4)} 2 locales`) +
          task("Checkout regression tests", T.qa, ["KP"], `${I("check", 11, "#8a93a4", 2.4)} 41 / 44 pass`),
      )}
      ${col(
        "Done",
        9,
        "#16a34a",
        task("Login with OTP", T.qa, ["KP"], `${I("check", 11, "#16a34a", 3)} Shipped`) +
          task("Category grid redesign", T.ux, ["AS"], `${I("check", 11, "#16a34a", 3)} Shipped`) +
          task("Sitemap & meta tags", T.seo, ["NJ"], `${I("check", 11, "#16a34a", 3)} Shipped`) +
          task("Razorpay integration", T.be, ["VD"], `${I("check", 11, "#16a34a", 3)} Shipped`),
      )}
    </div>
  </div>
  <div class="fl" style="left:960px;top:146px;width:400px;padding:20px 22px;transform:rotate(1.2deg)">
    <div class="row" style="justify-content:space-between"><div class="row" style="gap:10px"><span style="width:36px;height:36px;border-radius:12px;background:#e6f6fa;display:flex;align-items:center;justify-content:center">${I("video", 17, "#007f9d")}</span><div class="col"><b style="font-size:14px">Daily stand-up</b><span style="font-size:11px;color:#7a8496;font-weight:700">10:00 IST · 12 min</span></div></div><span class="pill" style="font-size:10.5px;padding:4px 9px;background:#e8f8ee;color:#15803d">Notes</span></div>
    <div style="margin-top:12px">
      <div class="note">${av("RM", people.RM, 28)}<div><b>Rahul</b><p>UPI retry flow works on test; pairing with Vivek on webhook timeouts.</p></div></div>
      <div class="note">${av("AS", people.AS, 28)}<div><b>Aditi</b><p>Slot picker v2 ready for review — two layouts to compare.</p></div></div>
      <div class="note">${av("NJ", people.NJ, 28)}<div><b>Neha</b><p>Blocked on Marathi copy sign-off from client.</p><span class="tag" style="display:inline-block;margin-top:6px;background:#fde8e8;color:#c0392b">Blocker</span></div></div>
    </div>
  </div>
  <div class="fl" style="left:1000px;top:630px;width:360px;padding:18px 20px;transform:rotate(-1.4deg)">
    <div class="row" style="justify-content:space-between"><span class="k">Burndown</span><span style="font-size:11px;font-weight:800;color:#15803d">On track</span></div>
    <svg width="${bw}" height="${bh + 18}" viewBox="0 0 ${bw} ${bh + 18}" style="margin-top:10px;overflow:visible">
      ${[0, 1, 2].map((i) => `<line x1="0" x2="${bw}" y1="${(i * bh) / 2}" y2="${(i * bh) / 2}" stroke="#eef1f5"/>`).join("")}
      <path d="M0,0 L${bw},${bh}" stroke="#c3c9d3" stroke-width="2" stroke-dasharray="5 5"/>
      ${(() => {
        const pts = burnAct.map((v, i) => [(i / 9) * bw, (1 - v / burnIdeal[0]) * bh]);
        return `<path d="${pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")}" fill="none" stroke="#00a1c6" stroke-width="3" stroke-linejoin="round"/>${pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#fff" stroke="#00a1c6" stroke-width="2"/>`).join("")}`;
      })()}
      ${["Day 1", "Day 5", "Day 10"].map((t, i) => `<text x="${(i * bw) / 2}" y="${bh + 16}" text-anchor="${["start", "middle", "end"][i]}" font-family="Manrope" font-weight="700" font-size="10.5" fill="#8a93a4">${t}</text>`).join("")}
    </svg>
  </div>`;
  return doc(W, H, css, body);
}

function sceneAutomation() {
  const W = 1200,
    H = 800;
  const node = (x, y, iconBg, icon, step, title, rows, id) => `
    <div class="node" id="${id}" style="left:${x}px;top:${y}px">
      <div class="nh"><span class="ni" style="background:${iconBg}">${icon}</span><div class="col" style="gap:1px"><span class="k">${step}</span><b>${title}</b></div><span class="ok">${I("check", 11, "#fff", 3.4)}</span></div>
      <div class="nb">${rows}</div>
    </div>`;
  const kv = (k, v) => `<div class="kv"><span>${k}</span><b>${v}</b></div>`;
  // Node boxes are 250 wide; the connectors are drawn in the page once the
  // nodes have laid out (see the inline script), as elbow curves:
  // n1 bottom → n2 left, n2 right → n3 bottom, n3 right → n4 top.
  const N = [
    [100, 156],
    [380, 410],
    [640, 156],
    [860, 410],
  ];
  const nw = 250;
  const css = `
  body{background:#f4f7fb;background-image:radial-gradient(#d3dbe7 1.2px,transparent 1.4px);background-size:22px 22px}
  .glow{position:absolute;inset:0;background:radial-gradient(600px 380px at 55% 45%,rgba(0,161,198,.16),transparent 70%)}
  .top{position:absolute;left:90px;right:90px;top:46px;height:60px;border-radius:18px;background:#fff;display:flex;align-items:center;padding:0 16px;gap:14px;box-shadow:0 12px 30px -16px rgba(11,16,32,.25)}
  .k{font-size:9.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#8a93a4}
  .node{position:absolute;width:${nw}px;background:#fff;border-radius:20px;box-shadow:0 1px 2px rgba(11,16,32,.06),0 26px 50px -24px rgba(11,16,32,.4);overflow:hidden}
  .nh{display:flex;align-items:center;gap:10px;padding:14px 14px 12px}
  .nh b{font-size:13.5px}
  .ni{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex:none}
  .ok{margin-left:auto;width:20px;height:20px;border-radius:50%;background:#16a34a;display:flex;align-items:center;justify-content:center;flex:none}
  .nb{border-top:1px solid #eef1f5;padding:10px 14px 13px;background:#fbfcfe;display:flex;flex-direction:column;gap:6px}
  .kv{display:flex;justify-content:space-between;gap:10px;font-size:11.5px;font-weight:600;color:#7a8496}
  .kv b{color:#0b1020;font-weight:800;text-align:right}
  .bubble{font-size:11.5px;font-weight:600;line-height:1.45;color:#1f2937;background:#dcf8c6;border-radius:12px 12px 12px 4px;padding:8px 10px}
  .log{position:absolute;left:90px;bottom:52px;width:560px;border-radius:18px;background:#0b1020;color:#e7ecf5;padding:14px 18px;display:flex;align-items:center;gap:16px;box-shadow:0 24px 50px -24px rgba(11,16,32,.6)}
  .ai{position:absolute;z-index:4;background:#fff;border-radius:999px;padding:7px 12px 7px 8px;display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:800;box-shadow:0 12px 26px -14px rgba(11,16,32,.4)}
  `;
  const body = `
  <div class="glow"></div>
  <div class="top">
    <span style="width:36px;height:36px;border-radius:11px;background:linear-gradient(135deg,#00a1c6,#0061a8);display:flex;align-items:center;justify-content:center">${I("zap", 17, "#fff")}</span>
    <div class="col" style="gap:1px"><b style="font-size:14px">Lead → Quote → Follow-up</b><span style="font-size:11px;font-weight:700;color:#8a93a4">Workflow · Sharma Interiors</span></div>
    <span style="margin-left:auto;font-size:11.5px;font-weight:700;color:#5d6779">Runs today <b style="color:#0b1020">128</b></span>
    <span style="font-size:11.5px;font-weight:700;color:#5d6779">Avg <b style="color:#0b1020">3.2 s</b></span>
    <span class="pill" style="font-size:11.5px;padding:7px 12px;background:#e8f8ee;color:#15803d"><i style="width:26px;height:15px;border-radius:999px;background:#16a34a;display:block;position:relative"><i style="position:absolute;right:2px;top:2px;width:11px;height:11px;border-radius:50%;background:#fff;display:block"></i></i>Active</span>
  </div>
  <svg id="links" width="${W}" height="${H}" style="position:absolute;inset:0;z-index:3"></svg>
  ${node(
    ...N[0],
    "#25d366",
    WHATSAPP(22),
    "Trigger · WhatsApp",
    "New message received",
    `<div class="bubble">Hi, I need a quote for 3BHK interiors in Wakad. Budget around ₹5–6 lakh.</div>${kv("From", "Neha Joshi · +91 98•••• 41230")}`,
    "n1",
  )}
  <div class="ai" id="ai">${`<span style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#7c5cff,#00a1c6);display:flex;align-items:center;justify-content:center">${I("sparkle", 13, "#fff")}</span>`}AI: “Quote request” · 97%</div>
  ${node(...N[1], "#e8f1fa", I("user", 19, "#0061a8"), "Step 2 · CRM", "Create lead", `${kv("Lead", "#1048 · Neha Joshi")}${kv("Stage", '<span style="color:#007f9d">New enquiry</span>')}${kv("Assigned to", "Arjun (Sales)")}`, "n2")}
  ${node(...N[2], "#fff3dc", I("file", 19, "#b46c00"), "Step 3 · Billing", "Generate quote", `${kv("Number", "QT-2026-0312")}${kv("Package", "3 BHK Essential")}${kv("Amount", "₹5,40,000 + GST")}`, "n3")}
  ${node(...N[3], "#ffe7f0", I("mail", 19, "#c2366f"), "Step 4 · Email", "Send quote & book visit", `${kv("To", "neha.joshi@gmail.com")}${kv("Attachment", "QT-2026-0312.pdf")}${kv("Status", '<span style="color:#15803d">Delivered · opened</span>')}`, "n4")}
  <div class="log">
    <span style="width:34px;height:34px;border-radius:50%;background:rgba(74,222,128,.15);display:flex;align-items:center;justify-content:center">${I("check", 16, "#4ade80", 3)}</span>
    <div class="col" style="gap:2px"><b style="font-size:13px">Run #4,812 completed</b><span style="font-size:11px;font-weight:600;color:#8fa3c4">4 steps · 3.1 s · 2 min ago</span></div>
    <div class="row" style="gap:6px;margin-left:auto">${["#25d366", "#0061a8", "#f59e0b", "#e8508a"].map((c) => `<i style="width:26px;height:6px;border-radius:9px;background:${c};display:block"></i>`).join("")}</div>
  </div>
  <script>
    document.fonts.ready.then(() => {
      const r = (id) => document.getElementById(id).getBoundingClientRect();
      const [a, b, c, d] = ["n1", "n2", "n3", "n4"].map(r);
      const paths = [
        // n1 bottom-centre → n2 left-middle
        [a.left + a.width / 2, a.bottom, b.left, b.top + b.height / 2, "v"],
        // n2 right-middle → n3 bottom-centre
        [b.right, b.top + b.height / 2, c.left + c.width / 2, c.bottom, "h"],
        // n3 right-middle → n4 top-centre
        [c.right, c.top + c.height / 2, d.left + d.width / 2, d.top, "h"],
      ];
      let svg = '<defs><linearGradient id="lk" x1="0" x2="1"><stop offset="0" stop-color="#00a1c6"/><stop offset="1" stop-color="#0061a8"/></linearGradient></defs>';
      for (const [x1, y1, x2, y2, first] of paths) {
        const dd = first === "v"
          ? "M" + x1 + "," + y1 + " C" + x1 + "," + (y2 - 10) + " " + (x1 + 30) + "," + y2 + " " + x2 + "," + y2
          : "M" + x1 + "," + y1 + " C" + (x2 - 30) + "," + y1 + " " + x2 + "," + (y1 + (y2 > y1 ? 10 : -10)) + " " + x2 + "," + y2;
        svg += '<path d="' + dd + '" fill="none" stroke="rgba(0,161,198,.16)" stroke-width="10" stroke-linecap="round"/>';
        svg += '<path d="' + dd + '" fill="none" stroke="url(#lk)" stroke-width="2.5" stroke-dasharray="7 6" stroke-linecap="round"/>';
        svg += '<circle cx="' + x1 + '" cy="' + y1 + '" r="6" fill="#fff" stroke="#00a1c6" stroke-width="2.5"/>';
        svg += '<circle cx="' + x2 + '" cy="' + y2 + '" r="6" fill="#fff" stroke="#0061a8" stroke-width="2.5"/>';
      }
      document.getElementById("links").innerHTML = svg;
      // Sit the AI label on the first connector's vertical run.
      const ai = document.getElementById("ai");
      const mid = (a.bottom + b.top + b.height / 2) / 2;
      ai.style.left = a.left + a.width / 2 - ai.offsetWidth / 2 + "px";
      ai.style.top = mid - ai.offsetHeight / 2 - 18 + "px";
    });
  </script>`;
  return doc(W, H, css, body);
}

function sceneProcesses() {
  const W = 900,
    H = 700;
  const screen = (wf) => `
    <div class="scrn ${wf ? "wf" : "ui"}">
      <div class="s-nav"><span class="logo">${wf ? "" : "K"}</span>${wf ? '<span class="ln" style="width:90px"></span>' : '<b class="sora" style="font-size:13px">Kaveri Ayurveda</b>'}<span style="flex:1"></span>${wf ? '<span class="ln" style="width:40px"></span><span class="ln" style="width:40px"></span><span class="ln" style="width:40px"></span>' : '<span class="lk">Shop</span><span class="lk">Rituals</span><span class="lk">About</span>'}<span class="btn sm">${wf ? "" : "Cart · 2"}</span></div>
      <div class="s-hero">
        <div class="col" style="gap:10px;justify-content:center">
          ${wf ? '<span class="ln" style="width:70px;height:14px;border-radius:999px"></span><span class="ln h" style="width:240px"></span><span class="ln h" style="width:190px"></span><span class="ln" style="width:230px;margin-top:4px"></span><span class="ln" style="width:200px"></span>' : '<span class="pill" style="font-size:10px;padding:4px 10px;background:#fff1dc;color:#b46c00;align-self:flex-start">New · Winter care</span><h2 class="sora">Daily rituals, rooted in Ayurveda.</h2><p>Cold-pressed oils and herbal blends made in small batches in Kerala.</p>'}
          <div class="row" style="gap:8px;margin-top:6px"><span class="btn">${wf ? "" : `Shop the range ${I("arrow", 12, "#fff", 2.6)}`}</span><span class="btn ghost">${wf ? "" : "Our story"}</span></div>
        </div>
        <div class="img">${wf ? '<svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100"><path d="M0,0 L100,100 M100,0 L0,100" stroke="#c4cad4" stroke-width=".6" vector-effect="non-scaling-stroke"/></svg>' : '<div class="bottle b1"></div><div class="bottle b2"></div><div class="leaf"></div><div class="leaf l2"></div>'}</div>
      </div>
      <div class="s-cards">
        ${[
          ["Kumkumadi oil", "₹1,250", "#f7d9b5"],
          ["Neem face wash", "₹340", "#d6efd8"],
          ["Brahmi hair oil", "₹480", "#e5ddf5"],
        ]
          .map(
            ([n, p, c]) => `<div class="pc"><div class="pimg" style="${wf ? "" : `background:${c}`}"></div>${wf ? '<span class="ln" style="width:80%"></span><span class="ln" style="width:40%"></span>' : `<b>${n}</b><span>${p}</span>`}</div>`,
          )
          .join("")}
      </div>
    </div>`;
  const css = `
  body{background:radial-gradient(520px 380px at 75% 30%,rgba(0,161,198,.2),transparent 70%),linear-gradient(160deg,#f7f9fc,#e7eef7)}
  .frame{position:absolute;left:70px;top:116px;width:760px;height:484px;border-radius:22px;overflow:hidden;background:#fff;box-shadow:0 2px 6px rgba(11,16,32,.06),0 40px 80px -30px rgba(11,16,32,.45)}
  .scrn{position:absolute;inset:0;padding:0 26px}
  .s-nav{height:58px;display:flex;align-items:center;gap:12px}
  .logo{width:28px;height:28px;border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;font:700 14px Sora}
  .lk{font-size:12px;font-weight:700;color:#5d6779}
  .s-hero{display:grid;grid-template-columns:1fr 1fr;gap:24px;height:236px}
  .s-hero h2{font-size:28px;line-height:1.1;letter-spacing:-.03em;font-weight:600}
  .s-hero p{font-size:12.5px;line-height:1.55;color:#5d6779;max-width:270px}
  .btn{display:inline-flex;align-items:center;gap:6px;height:36px;min-width:110px;justify-content:center;border-radius:999px;font-size:12px;font-weight:800}
  .btn.sm{height:30px;min-width:76px}
  .img{position:relative;border-radius:18px;overflow:hidden}
  .s-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:22px}
  .pc{display:flex;flex-direction:column;gap:6px}
  .pimg{height:92px;border-radius:14px}
  .pc b{font-size:12.5px}.pc span{font-size:11.5px;font-weight:700;color:#5d6779}
  /* wireframe */
  .wf{background:#f6f7f9}
  .wf .logo{background:#d4d9e1}
  .wf .ln{display:block;height:8px;border-radius:4px;background:#d9dee6}
  .wf .ln.h{height:20px;border-radius:6px;background:#c9cfd9}
  .wf .btn{background:#d4d9e1}.wf .btn.ghost{background:none;border:1.5px dashed #c4cad4}
  .wf .img{border:1.5px dashed #c4cad4;background:#eceff3}
  .wf .pimg{border:1.5px dashed #c4cad4;background:#eceff3}
  /* final */
  .ui{background:#fffaf3;clip-path:polygon(54% 0,100% 0,100% 100%,40% 100%)}
  .ui .logo{background:linear-gradient(135deg,#2f7046,#4f9a63)}
  .ui .btn{background:#2f5d3a;color:#fff;box-shadow:0 10px 20px -10px rgba(47,93,58,.8)}.ui .btn.ghost{background:none;color:#2f5d3a;border:1.5px solid #cfe0d2;box-shadow:none}
  .ui .btn.sm{background:#0b1020}
  .ui .img{background:radial-gradient(circle at 70% 30%,#ffe7c2,transparent 60%),linear-gradient(160deg,#f3dcc0,#e7c49d)}
  .bottle{position:absolute;bottom:22px;border-radius:14px 14px 10px 10px}
  .b1{left:30%;width:22%;height:56%;background:linear-gradient(90deg,#7a3e18,#b0632e 45%,#7a3e18)}
  .b1::before{content:"";position:absolute;left:30%;top:-16%;width:40%;height:18%;background:#2b2b2b;border-radius:4px}
  .b1::after{content:"";position:absolute;left:14%;right:14%;top:36%;height:30%;background:#fff7e8;border-radius:4px}
  .b2{left:56%;width:16%;height:40%;background:linear-gradient(90deg,#2f5d3a,#4f8a5c 45%,#2f5d3a)}
  .b2::after{content:"";position:absolute;left:16%;right:16%;top:34%;height:30%;background:#fff7e8;border-radius:3px}
  .leaf{position:absolute;left:12%;bottom:18px;width:22%;height:46%;border-radius:50% 50% 50% 50%/70% 70% 30% 30%;background:linear-gradient(180deg,#5d9e5f,#2f7046);transform:rotate(-24deg);transform-origin:50% 100%}
  .leaf.l2{left:74%;transform:rotate(26deg);height:38%}
  .split{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none}
  .handle{position:absolute;left:${70 + 760 * 0.47 - 22}px;top:${116 + 242 - 22}px;width:44px;height:44px;border-radius:50%;background:#fff;box-shadow:0 10px 24px -8px rgba(11,16,32,.45),0 0 0 4px rgba(0,161,198,.25);display:flex;align-items:center;justify-content:center;gap:0;z-index:4}
  .lbl{position:absolute;top:74px;font-size:11.5px;font-weight:800;padding:7px 13px;border-radius:999px;display:flex;align-items:center;gap:7px}
  .note{position:absolute;background:#fff;border-radius:14px;padding:10px 12px;font-size:11.5px;font-weight:700;line-height:1.4;box-shadow:0 18px 36px -16px rgba(11,16,32,.4);display:flex;gap:9px;align-items:flex-start;z-index:5}
  `;
  // Diagonal seam from (54%,0) to (40%,100%) of the frame.
  const fx = 70,
    fy = 116,
    fw = 760,
    fh = 484;
  const body = `
  <span class="lbl" style="left:70px;background:#fff;color:#5d6779;box-shadow:0 8px 20px -12px rgba(11,16,32,.35)">${I("grid", 13, "#8a93a4", 2.4)} Wireframe</span>
  <span class="lbl" style="right:70px;background:#0b1020;color:#fff">${I("sparkle", 13, "#5fd7f2", 2.2)} Final UI</span>
  <div class="frame">${screen(true)}${screen(false)}</div>
  <svg class="split" width="${W}" height="${H}"><line x1="${fx + fw * 0.54}" y1="${fy}" x2="${fx + fw * 0.4}" y2="${fy + fh}" stroke="#00a1c6" stroke-width="3"/></svg>
  <div class="handle">${I("left", 15, "#0061a8", 2.8)}${I("right", 15, "#0061a8", 2.8)}</div>
  <div class="note" style="left:40px;top:528px;width:210px;transform:rotate(-2deg)">${av("AS", "#e8508a", 22, 9)}<span>Keep one primary CTA in the hero — tested 3, clearest wins.</span></div>
  <div class="note" style="right:36px;top:470px;width:186px;transform:rotate(2deg)"><span style="width:22px;height:22px;border-radius:7px;background:#e8f8ee;display:flex;align-items:center;justify-content:center;flex:none">${I("check", 12, "#15803d", 3)}</span><span>Contrast AA · tap targets 44 px</span></div>`;
  return doc(W, H, css, body);
}

function sceneGrowth() {
  const W = 900,
    H = 700;
  const traffic = [2.1, 2.4, 3.1, 3.6, 4.9, 6.2, 7.4, 9.1, 10.6, 12.5];
  const tw = 376,
    th = 100;
  const [px, py] = chartPoint(traffic, tw, th, 0, 14, traffic.length - 1, 0);
  const result = (pos, url, title, desc, on) => `
    <div class="res ${on ? "on" : ""}">
      <div class="row" style="gap:10px"><span class="fav" style="background:${on ? "linear-gradient(135deg,#00a1c6,#0061a8)" : "#e3e8ef"}">${on ? "S" : ""}</span><div class="col" style="gap:0"><span class="site">${url.split(" › ")[0]}</span><span class="url">${url}</span></div>${on ? `<span class="rank">${I("trend", 12, "#fff", 2.6)} #1</span>` : `<span class="pos">#${pos}</span>`}</div>
      <div class="ttl">${title}</div>
      ${on ? `<div class="row" style="gap:4px;font-size:11.5px;font-weight:700;color:#5d6779;margin:3px 0 4px">${STAR(12)}${STAR(12)}${STAR(12)}${STAR(12)}${STAR(12)}<span style="margin-left:4px">4.9 · 312 reviews · ₹₹</span></div>` : ""}
      <div class="dsc">${desc}</div>
    </div>`;
  const css = `
  body{background:radial-gradient(520px 420px at 85% 80%,rgba(0,161,198,.22),transparent 70%),radial-gradient(500px 380px at 10% 0%,rgba(0,97,168,.12),transparent 70%),linear-gradient(160deg,#f7f9fc,#e7eef7)}
  .serp{left:54px;top:90px;width:520px;padding:18px 20px 8px;border-radius:24px;transform:rotate(-1.2deg)}
  .bar2{display:flex;align-items:center;gap:10px;height:46px;border-radius:999px;border:1px solid #e3e8ef;padding:0 18px;font-size:14px;font-weight:600;box-shadow:0 4px 12px -6px rgba(11,16,32,.15)}
  .tabs{display:flex;gap:18px;font-size:12px;font-weight:700;color:#7a8496;margin:12px 6px 4px;padding-bottom:8px;border-bottom:1px solid #eef1f5}
  .tabs .on{color:#0061a8;box-shadow:0 10px 0 -7px #0061a8}
  .res{padding:12px 12px;border-radius:16px;margin:4px 0}
  .res.on{background:linear-gradient(180deg,#f2fbfe,#fff);box-shadow:0 0 0 1.5px #9fdcec,0 18px 32px -20px rgba(0,97,168,.5);margin:8px -6px}
  .res:not(.on){opacity:.55}
  .fav{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font:700 12px Sora;flex:none}
  .site{font-size:12px;font-weight:700}
  .url{font-size:11px;color:#5d6779;font-weight:600}
  .ttl{font-size:16.5px;font-weight:700;color:#1a4fb4;margin-top:7px;letter-spacing:-.01em;line-height:1.3}
  .dsc{font-size:12px;line-height:1.5;color:#4b5563;font-weight:500}
  .rank{margin-left:auto;display:inline-flex;align-items:center;gap:5px;background:linear-gradient(135deg,#00a1c6,#0061a8);color:#fff;font:700 12px Sora;padding:5px 10px;border-radius:999px}
  .pos{margin-left:auto;font-size:11.5px;font-weight:800;color:#8a93a4}
  .tr{left:430px;top:300px;width:420px;padding:20px 22px;border-radius:24px;transform:rotate(1.5deg);box-shadow:0 2px 4px rgba(11,16,32,.05),0 40px 70px -26px rgba(11,16,32,.45)}
  .k{font-size:10.5px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#7a8496}
  .kw{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:700;padding:7px 0;border-top:1px solid #eef1f5}
  .up{color:#15803d;font-weight:800;display:flex;align-items:center;gap:2px}
  `;
  const months = ["Jan", "Mar", "May", "Jul", "Oct"];
  const body = `
  <div class="card abs serp">
    <div class="bar2">${I("search", 18, "#0061a8", 2.4)}<span>best interior designer in pune</span><span style="margin-left:auto">${I("more", 18, "#9aa3b2")}</span></div>
    <div class="tabs"><span class="on">All</span><span>Maps</span><span>Images</span><span>Reviews</span><span style="margin-left:auto;font-weight:600">About 1,24,00,000 results</span></div>
    ${result(1, "sharmainteriors.in › modular-kitchens", "Sharma Interiors — Modular Kitchens & Full-Home Interiors in Pune", "3D designs in 48 hours, in-house manufacturing and 45-day installation. Packages from ₹3.9L.", true)}
    ${result(2, "homestudio.co.in › pune", "Home Studio | Interior Design Services Pune", "Residential and office interiors across Pune and PCMC…", false)}
    ${result(3, "decorlane.in › blog", "15 Interior Design Ideas for Pune Apartments", "Space-saving ideas for 2 BHK and 3 BHK flats…", false)}
  </div>
  <div class="card abs tr">
    <div class="row" style="justify-content:space-between;align-items:flex-start">
      <div><span class="k">Organic traffic</span><div class="row" style="gap:10px;margin-top:6px"><b class="sora" style="font-size:30px;letter-spacing:-.02em">12,480</b><span style="font-size:12px;font-weight:700;color:#7a8496">visits / month</span></div></div>
      <span class="pill" style="font-size:11.5px;padding:6px 10px;background:#e8f8ee;color:#15803d">${I("trend", 13, "#15803d", 2.6)} +184%</span>
    </div>
    <svg width="${tw}" height="${th + 22}" viewBox="0 0 ${tw} ${th + 22}" style="margin-top:12px;overflow:visible">
      ${[0, 1, 2].map((i) => `<line x1="0" x2="${tw}" y1="${(i * th) / 2}" y2="${(i * th) / 2}" stroke="#eef1f5"/>`).join("")}
      ${traffic.map((v, i) => `<rect x="${(i / (traffic.length - 1)) * (tw - 16)}" y="${th - (v / 14) * th}" width="16" height="${(v / 14) * th}" rx="4" fill="rgba(0,97,168,.08)"/>`).join("")}
      ${areaChart({ values: traffic, w: tw, h: th, min: 0, max: 14, color: C.cyan, id: "tf", padTop: 0 })}
      <circle cx="${px}" cy="${py}" r="11" fill="rgba(0,161,198,.2)"/><circle cx="${px}" cy="${py}" r="5.5" fill="#fff" stroke="#00a1c6" stroke-width="3"/>
      ${months.map((m, i) => `<text x="${(i * tw) / 4}" y="${th + 18}" text-anchor="${i === 0 ? "start" : i === 4 ? "end" : "middle"}" font-family="Manrope" font-weight="700" font-size="10.5" fill="#8a93a4">${m}</text>`).join("")}
    </svg>
    <div style="margin-top:10px">
      <div class="kw"><span>interior designer pune</span><span style="margin-left:auto;font-weight:800">#1</span><span class="up">${I("trend", 11, "#15803d", 2.6)}4</span></div>
      <div class="kw"><span>modular kitchen price pune</span><span style="margin-left:auto;font-weight:800">#2</span><span class="up">${I("trend", 11, "#15803d", 2.6)}7</span></div>
    </div>
  </div>`;
  return doc(W, H, css, body);
}

/* ------------------------------------------------------------------ */
/* Slots                                                               */
/* ------------------------------------------------------------------ */

const SLOTS = [
  { key: "heroBackdrop", file: "hero-backdrop", w: 1920, h: 1080, scene: sceneHero },
  { key: "aboutOffice", file: "about-office", w: 1080, h: 1200, scene: sceneAbout },
  { key: "serviceWeb", file: "service-web", w: 1200, h: 800, scene: sceneServiceWeb },
  { key: "serviceCloud", file: "service-cloud", w: 900, h: 700, scene: sceneCloud },
  { key: "caseStudyFeature", file: "case-study-feature", w: 1000, h: 800, scene: sceneCaseStudy },
  { key: "projectMedicare", file: "project-medicare", w: 900, h: 1000, scene: sceneMedicare },
  { key: "skillsGap", file: "skills-gap", w: 1400, h: 900, scene: sceneSkills },
  { key: "articleAutomation", file: "article-automation", w: 1200, h: 800, scene: sceneAutomation },
  { key: "articleProcesses", file: "article-processes", w: 900, h: 700, scene: sceneProcesses },
  { key: "articleGrowth", file: "article-growth", w: 900, h: 700, scene: sceneGrowth },
];

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

/** Local Playwright first; fall back to a global install whose browsers are present. */
async function launchChromium() {
  const candidates = [() => import("playwright")];
  try {
    const globalRoot = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
    candidates.push(async () => createRequire(join(globalRoot, "noop.js"))("playwright"));
  } catch {
    /* no global npm root */
  }
  let lastError;
  for (const load of candidates) {
    try {
      const mod = await load();
      const chromium = mod.chromium ?? mod.default?.chromium;
      return await chromium.launch();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

function hasPil() {
  try {
    execFileSync("python3", ["-I", "-c", "import PIL"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const PIL_SCRIPT = `
import sys
from PIL import Image
src, dst, w, h, q = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
im = Image.open(src).convert("RGB").resize((w, h), Image.LANCZOS)
im.save(dst, "JPEG", quality=q, optimize=True, progressive=True)
`;

/** Downscale the 2× PNG to the exact slot size and encode within the size budget. */
function encode(png, jpg, w, h, usePil) {
  if (usePil) {
    for (const q of [85, 82, 78, 74, 70]) {
      execFileSync("python3", ["-I", "-c", PIL_SCRIPT, png, jpg, String(w), String(h), String(q)]);
      if (statSync(jpg).size <= MAX_BYTES) return q;
    }
    return 70;
  }
  for (const q of [3, 4, 5, 6, 8]) {
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", png, "-vf", `scale=${w}:${h}:flags=lanczos`, "-q:v", String(q), jpg]);
    if (statSync(jpg).size <= MAX_BYTES) return `q:v ${q}`;
  }
  return "q:v 8";
}

async function main() {
  const only = new Set(process.argv.slice(2));
  const slots = only.size ? SLOTS.filter((s) => only.has(s.key)) : SLOTS;
  if (!slots.length) throw new Error(`No matching slots. Keys: ${SLOTS.map((s) => s.key).join(", ")}`);

  mkdirSync(outDir, { recursive: true });
  const tmp = join(tmpdir(), `setuware-mockups-${process.pid}`);
  mkdirSync(tmp, { recursive: true });
  const usePil = hasPil();

  const browser = await launchChromium();
  const context = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 1200, height: 800 } });
  try {
    for (const slot of slots) {
      const page = await context.newPage();
      await page.setViewportSize({ width: slot.w, height: slot.h });
      await page.setContent(slot.scene(), { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        const faces = ["400 16px Manrope", "600 16px Manrope", "700 16px Manrope", "800 16px Manrope", "500 16px Sora", "600 16px Sora", "700 16px Sora"];
        await Promise.all(faces.map((f) => document.fonts.load(f)));
        await document.fonts.ready;
      });
      const ok = await page.evaluate(() => document.fonts.check("600 16px Sora") && document.fonts.check("700 16px Manrope"));
      if (!ok) console.warn(`  ! ${slot.key}: web fonts did not load, using fallbacks`);
      const png = join(tmp, `${slot.file}.png`);
      await page.screenshot({ path: png, clip: { x: 0, y: 0, width: slot.w, height: slot.h } });
      await page.close();

      const jpg = join(outDir, `${slot.file}.jpg`);
      const q = encode(png, jpg, slot.w, slot.h, usePil);
      console.log(`  ✓ ${slot.key.padEnd(18)} ${slot.w}×${slot.h}  ${(statSync(jpg).size / 1024).toFixed(0)} KB  (${usePil ? "PIL q" : "ffmpeg "}${q})`);
    }
  } finally {
    await browser.close();
    rmSync(tmp, { recursive: true, force: true });
  }

  // Re-read right before writing: other tools own other keys in this file.
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : {};
  const images = {};
  for (const slot of SLOTS) {
    if (existsSync(join(outDir, `${slot.file}.jpg`))) images[slot.key] = `/images/photos/${slot.file}.jpg`;
  }
  manifest.images = images;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`  → ${Object.keys(images).length} slots recorded in src/lib/media-manifest.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
