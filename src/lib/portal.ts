import { site } from "@/lib/site";

/**
 * The team portal (admin + employee pages under /admin) can live on its own
 * host, e.g. https://core.setuware.in, set with `PORTAL_URL` at runtime.
 * Unset, the portal stays on the main site (setuware.in/admin).
 */

const trim = (url: string) => url.replace(/\/+$/, "");

export function portalUrl(): string {
  return trim(process.env.PORTAL_URL?.trim() || site.url);
}

/** Absolute portal link, e.g. `adminUrl("/login")` → https://core.setuware.in/admin/login. */
export function adminUrl(path = ""): string {
  return `${portalUrl()}/admin${path}`;
}

/** Absolute link for an in-app path that already starts with /admin. */
export function portalLink(path: string): string {
  return `${portalUrl()}${path}`;
}

/** Paths both hosts must answer: the portal itself, APIs, and shared assets. */
const SHARED = /^\/(?:admin(?:\/|$)|admin-sw\.js$|admin-offline\.html$|api\/|_next\/|favicon\.ico$|apple-icon|images\/|media\/)/;

export type PortalDecision = { type: "next" } | { type: "redirect"; url: string } | { type: "robots" };

/**
 * Where a request should go when the portal has its own host:
 * - portal host: `/` opens the portal, public pages go back to the main site,
 *   and robots.txt blocks crawlers;
 * - main site: /admin/* moves to the portal host.
 */
export function routePortal(host: string | null, pathname: string, search = ""): PortalDecision {
  const portal = portalUrl();
  const main = trim(site.url);
  if (portal === main || !host) return { type: "next" };

  const portalHost = new URL(portal).host.toLowerCase();
  const onPortal = host.toLowerCase() === portalHost;

  if (onPortal) {
    if (pathname === "/") return { type: "redirect", url: `${portal}/admin${search}` };
    if (pathname === "/robots.txt") return { type: "robots" };
    if (SHARED.test(pathname)) return { type: "next" };
    return { type: "redirect", url: `${main}${pathname}${search}` };
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return { type: "redirect", url: `${portal}${pathname}${search}` };
  }
  return { type: "next" };
}
