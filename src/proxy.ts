import { NextResponse, type NextRequest } from "next/server";

import { KNOWN_SLUGS } from "@/lib/routes";

/**
 * Returns a real 404 for unknown content slugs.
 *
 * Why this exists: with Cache Components, a dynamic route that has
 * `generateStaticParams` serves a prerendered fallback shell before the page
 * body resolves, so a page that later calls `notFound()` has already answered
 * 200. That is a soft 404 — crawlers index the error page and the bogus URL
 * keeps its ranking. Neither of the usual fixes is available: `dynamicParams`
 * is rejected under Cache Components, and `NextResponse.rewrite` cannot change
 * the status of the response it rewrites to.
 *
 * So we answer here instead: fetch the prerendered 404 page once, keep it in
 * module scope, and return it with the right status. Valid URLs cost a single
 * Set lookup and never touch this path.
 */

/** Cached for the lifetime of the worker; the page is static per build. */
let cachedNotFoundHtml: string | null = null;

const FALLBACK_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Page not found</title><meta name="robots" content="noindex"></head><body><h1>404 — page not found</h1><p><a href="/">Return to setuware.</a></p></body></html>`;

async function notFoundPage(origin: string): Promise<string> {
  if (cachedNotFoundHtml !== null) return cachedNotFoundHtml;

  try {
    const response = await fetch(new URL("/not-found", origin), {
      // A slow self-fetch must not hold the request open.
      signal: AbortSignal.timeout(2_000),
    });
    if (!response.ok) throw new Error(`not-found page returned ${response.status}`);
    cachedNotFoundHtml = await response.text();
  } catch {
    // Never let the 404 path itself fail: a plain page beats a 500.
    cachedNotFoundHtml = FALLBACK_HTML;
  }

  return cachedNotFoundHtml;
}

export async function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  if (segments.length !== 2) return NextResponse.next();

  const [section, slug] = segments;
  const known = KNOWN_SLUGS[section];
  if (!known) return NextResponse.next();

  let decoded = slug;
  try {
    decoded = decodeURIComponent(slug);
  } catch {
    // Malformed percent-encoding is, by definition, not a slug we publish.
  }

  if (known.has(decoded)) return NextResponse.next();

  const html = await notFoundPage(request.nextUrl.origin);

  return new NextResponse(request.method === "HEAD" ? null : html, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // Let a CDN serve the 404 too, but re-check often enough that publishing
      // the missing page makes it live promptly.
      "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
      "x-robots-tag": "noindex",
    },
  });
}

export const config = {
  matcher: ["/services/:slug", "/work/:slug", "/blog/:slug", "/industries/:slug", "/careers/:slug"],
};
