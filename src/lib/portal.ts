import { site } from "./site";

const hostOf = (url: string) => new URL(url).host.toLowerCase();

/**
 * Paths the admin and employee portal serves: the admin app, its API calls,
 * build assets and the files the admin pages and service worker load.
 */
const PORTAL_PATH = /^\/(?:admin(?:\/|$)|api\/|_next\/|media\/|images\/|admin-sw\.js$|admin-offline\.html$|apple-icon|icon|favicon\.ico$)/;

/**
 * Where a request should go so the portal host only shows sign-in and
 * dashboards, and the website host sends admin traffic to the portal.
 * Returns `null` when the request should be served as is.
 */
export function portalRedirect(host: string | null, pathname: string, search = ""): string | null {
  if (!host) return null;
  const requestHost = host.toLowerCase();
  const portalHost = hostOf(site.portalUrl);
  const siteHost = hostOf(site.url);
  if (portalHost === siteHost) return null;

  if (requestHost === portalHost) {
    if (pathname === "/") return `${site.portalUrl}/admin${search}`;
    if (PORTAL_PATH.test(pathname)) return null;
    return `${site.url}${pathname}${search}`;
  }

  const isSiteHost = requestHost === siteHost || requestHost === `www.${siteHost}`;
  if (isSiteHost && /^\/admin(?:\/|$)/.test(pathname)) return `${site.portalUrl}${pathname}${search}`;

  return null;
}
