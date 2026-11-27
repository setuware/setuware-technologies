import { site } from "./site";

const hostOf = (url: string) => new URL(url).host.toLowerCase();

/**
 * Paths the admin and employee portal serves: the admin app, its API calls,
 * build assets and the files the admin pages and service worker load.
 */
const PORTAL_PATH = /^\/(?:admin(?:\/|$)|api\/|_next\/|media\/|images\/|admin-sw\.js$|admin-offline\.html$|apple-icon|icon|favicon\.ico$)/;

/** Sign-in pages, served on the portal without the `/admin` prefix. */
const AUTH_PAGE = /^\/(login|forgot|set-password)$/;
const ADMIN_AUTH_PAGE = /^\/admin\/(login|forgot|set-password)$/;

/** Admin paths the browser fetches without the session cookie (install prompt). */
const PUBLIC_ADMIN_ASSET = /^\/admin\/(?:manifest\.webmanifest$|app-icon\/)/;

const portalEnabled = () => hostOf(site.portalUrl) !== hostOf(site.url);

/** Full link to a sign-in page (`login`, `forgot`, `set-password`) for emails. */
export function authUrl(page: "login" | "forgot" | "set-password", query = ""): string {
  return portalEnabled() ? `${site.portalUrl}/${page}${query}` : `${site.url}/admin/${page}${query}`;
}

/**
 * How far the installable app reaches on this host. The portal host is all
 * portal, and its sign-in page sits at `/login`, outside `/admin`.
 */
export function pwaScope(host: string | null): "/" | "/admin" {
  return host && portalEnabled() && host.toLowerCase() === hostOf(site.portalUrl) ? "/" : "/admin";
}

/** The page that answers a portal sign-in URL: `/login` is served by `/admin/login`. */
export function portalRewrite(host: string | null, pathname: string): string | null {
  if (!host || !portalEnabled() || host.toLowerCase() !== hostOf(site.portalUrl)) return null;
  return AUTH_PAGE.test(pathname) ? `/admin${pathname}` : null;
}

/**
 * Where a request should go so the portal host only shows sign-in and
 * dashboards, and the website host sends admin traffic to the portal.
 * Returns `null` when the request should be served as is.
 */
export function portalRedirect(host: string | null, pathname: string, search = "", signedIn = true): string | null {
  if (!host) return null;
  const requestHost = host.toLowerCase();
  const portalHost = hostOf(site.portalUrl);
  const siteHost = hostOf(site.url);
  if (portalHost === siteHost) return null;

  if (requestHost === portalHost) {
    const authPage = ADMIN_AUTH_PAGE.exec(pathname);
    if (authPage) return `${site.portalUrl}/${authPage[1]}${search}`;
    if (AUTH_PAGE.test(pathname)) return null;
    if (pathname === "/") return signedIn ? `${site.portalUrl}/admin${search}` : `${site.portalUrl}/login`;
    if (!signedIn && /^\/admin(?:\/|$)/.test(pathname) && !PUBLIC_ADMIN_ASSET.test(pathname)) return `${site.portalUrl}/login`;
    if (PORTAL_PATH.test(pathname)) return null;
    return `${site.url}${pathname}${search}`;
  }

  const isSiteHost = requestHost === siteHost || requestHost === `www.${siteHost}`;
  if (isSiteHost && /^\/admin(?:\/|$)/.test(pathname)) {
    const authPage = ADMIN_AUTH_PAGE.exec(pathname);
    return `${site.portalUrl}${authPage ? `/${authPage[1]}` : pathname}${search}`;
  }

  return null;
}
