/**
 * The SW brand mark (ring with circuit nodes, S, and a W that sweeps into the
 * ring), drawn on a 100 x 100 grid. One source for the header logo, the app
 * icons and the favicon.
 */

export const MARK_PATHS = {
  ring: "M13.60 32.25A40.5 40.5 0 0 1 86.40 32.25M90.20 45.06A40.5 40.5 0 0 1 13.60 67.75",
  nodes: "M73.53 20.87a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0-9.2 0ZM76.13 20.87a2 2 0 1 1 4 0a2 2 0 1 1-4 0ZM18.30 80.10a4.6 4.6 0 1 0 9.2 0a4.6 4.6 0 1 0-9.2 0ZM20.90 80.10a2 2 0 1 1 4 0a2 2 0 1 1-4 0Z",
  s: "M39.6 39.4C37.8 35.6 34 33.4 28.8 33.4 22.2 33.4 17.8 36.6 17.8 41.4c0 10.4 21.6 6 21.6 16.4 0 5.6-5 9.4-12 9.4-6.8 0-12-3-15.8-8",
  w: "M35 31 L44 31 L51.2 57.5 L55.6 40 L61.4 40 L65.9 57.5 L72.6 33.6 C74.6 27.6 79 25.4 83.6 26.4 C90.4 27.9 95.2 34.8 95.6 44.4 L86.6 44.4 C86.2 38.8 84.4 35.4 81.9 35.3 C80.3 35.2 79.3 36.7 78.5 39.6 L69.6 70 L62.4 70 L58.5 55.6 L54.6 70 L47.4 70 Z",
} as const;

export const MARK_COLORS = {
  light: { ring: "#1d3fae", w: ["#1d3fae", "#1468ad", "#0a8ea6"] },
  dark: { ring: "#6a8cff", w: ["#6a8cff", "#3fa9e8", "#22c3e6"] },
} as const;

/** Standalone SVG markup, for icons generated at build time. */
export function markSvg(theme: "light" | "dark" = "light", size?: number, background?: string): string {
  const c = MARK_COLORS[theme];
  const dims = size ? ` width="${size}" height="${size}"` : "";
  const bg = background ? `<rect width="100" height="100" fill="${background}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${dims}><defs><linearGradient id="sw" x1="40" y1="0" x2="92" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.w[0]}"/><stop offset=".55" stop-color="${c.w[1]}"/><stop offset="1" stop-color="${c.w[2]}"/></linearGradient></defs>${bg}<path d="${MARK_PATHS.ring}" fill="none" stroke="${c.ring}" stroke-width="9"/><path d="${MARK_PATHS.nodes}" fill="${c.ring}" fill-rule="evenodd"/><path d="${MARK_PATHS.s}" fill="none" stroke="${c.ring}" stroke-width="9.4"/><path d="${MARK_PATHS.w}" fill="url(#sw)"/></svg>`;
}
