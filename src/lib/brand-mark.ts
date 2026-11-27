/**
 * The SW brand mark — the V3 ribbon (Nov 2026), drawn on a 100 x 100 grid.
 * The flat vector form of the mark, for contexts that need an SVG. The
 * favicon and app icons use the glossy ribbon raster instead
 * (`public/images/favicon-v4-512.png`, src/app/icon.png, src/app/favicon.ico): the flat SW read as a cheap
 * redraw at icon sizes.
 *
 * The old ringed monogram (ring + circuit nodes around the SW) is gone: it
 * read as the "old logo" even after the V3 gradient landed, because the
 * shape never changed. The V3 mark is the ribbon SW alone — the S as a
 * gradient stroke flowing into the gradient W — with no ring around it.
 * The header wordmark keeps the glossy ribbon PNG; this is its flat vector
 * form, for the sizes where the raster art turns to mush (16–180 px).
 */

export const MARK_PATHS = {
  s: "M39.6 39.4C37.8 35.6 34 33.4 28.8 33.4 22.2 33.4 17.8 36.6 17.8 41.4c0 10.4 21.6 6 21.6 16.4 0 5.6-5 9.4-12 9.4-6.8 0-12-3-15.8-8",
  w: "M35 31 L44 31 L51.2 57.5 L55.6 40 L61.4 40 L65.9 57.5 L72.6 33.6 C74.6 27.6 79 25.4 83.6 26.4 C90.4 27.9 95.2 34.8 95.6 44.4 L86.6 44.4 C86.2 38.8 84.4 35.4 81.9 35.3 C80.3 35.2 79.3 36.7 78.5 39.6 L69.6 70 L62.4 70 L58.5 55.6 L54.6 70 L47.4 70 Z",
} as const;

// V3 palette (Nov 2026): cyan -> blue -> violet, sampled from the V3 ribbon logo.
export const MARK_COLORS = {
  light: { w: ["#06b6d4", "#2563eb", "#7c3aed"] },
  dark: { w: ["#22d3ee", "#60a5fa", "#c084fc"] },
} as const;

/**
 * Standalone SVG markup, for icons generated at build time.
 *
 * The SW band spans roughly x 12–96, y 25–70 on the grid, so it is shifted
 * to sit centred in the square (`translate(-4, 2.5)`). Pass `background` for
 * a rounded navy chip behind it — the favicon / manifest SVG — otherwise the
 * mark is transparent and the caller provides the background.
 */
export function markSvg(theme: "light" | "dark" = "light", size?: number, background?: string): string {
  const c = MARK_COLORS[theme];
  const dims = size ? ` width="${size}" height="${size}"` : "";
  const bg = background ? `<rect width="100" height="100" rx="20" fill="${background}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"${dims}><defs><linearGradient id="sw" x1="12" y1="0" x2="96" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${c.w[0]}"/><stop offset=".55" stop-color="${c.w[1]}"/><stop offset="1" stop-color="${c.w[2]}"/></linearGradient></defs>${bg}<g transform="translate(-4 2.5)"><path d="${MARK_PATHS.s}" fill="none" stroke="url(#sw)" stroke-width="10" stroke-linecap="round"/><path d="${MARK_PATHS.w}" fill="url(#sw)"/></g></svg>`;
}
