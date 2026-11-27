import { describe, expect, it } from "vitest";

import { authUrl, portalRedirect, portalRewrite } from "@/lib/portal";

describe("portalRedirect", () => {
  it("opens the dashboard from the portal root when signed in, the sign-in page otherwise", () => {
    expect(portalRedirect("core.setuware.in", "/")).toBe("https://core.setuware.in/admin");
    expect(portalRedirect("core.setuware.in", "/", "", false)).toBe("https://core.setuware.in/login");
    expect(portalRedirect("core.setuware.in", "/admin/tasks", "", false)).toBe("https://core.setuware.in/login");
  });

  it("keeps sign-in pages at /login, /forgot and /set-password on the portal", () => {
    expect(portalRedirect("core.setuware.in", "/admin/login", "?step=code")).toBe("https://core.setuware.in/login?step=code");
    expect(portalRedirect("core.setuware.in", "/admin/set-password", "?token=a", false)).toBe("https://core.setuware.in/set-password?token=a");
    for (const path of ["/login", "/forgot", "/set-password"]) {
      expect(portalRedirect("core.setuware.in", path, "", false)).toBeNull();
      expect(portalRewrite("core.setuware.in", path)).toBe(`/admin${path}`);
    }
    expect(portalRewrite("setuware.in", "/login")).toBeNull();
    expect(portalRewrite("localhost:3000", "/login")).toBeNull();
    expect(portalRewrite("core.setuware.in", "/admin/tasks")).toBeNull();
    expect(authUrl("login")).toBe("https://core.setuware.in/login");
    expect(authUrl("set-password", "?token=a")).toBe("https://core.setuware.in/set-password?token=a");
  });

  it("serves admin, API and asset paths on the portal", () => {
    for (const path of ["/admin", "/admin/tasks/4", "/api/health", "/_next/data/x.json", "/media/a.mp4", "/admin-sw.js", "/apple-icon", "/favicon.ico"]) {
      expect(portalRedirect("core.setuware.in", path)).toBeNull();
    }
  });

  it("sends website pages on the portal to the website", () => {
    expect(portalRedirect("core.setuware.in", "/services", "?a=1")).toBe("https://setuware.in/services?a=1");
    expect(portalRedirect("CORE.setuware.in", "/administrator")).toBe("https://setuware.in/administrator");
  });

  it("moves admin traffic on the website to the portal", () => {
    expect(portalRedirect("setuware.in", "/admin/login", "?step=code")).toBe("https://core.setuware.in/login?step=code");
    expect(portalRedirect("setuware.in", "/admin/tasks")).toBe("https://core.setuware.in/admin/tasks");
    expect(portalRedirect("www.setuware.in", "/admin")).toBe("https://core.setuware.in/admin");
  });

  it("leaves website pages and other hosts alone", () => {
    expect(portalRedirect("setuware.in", "/")).toBeNull();
    expect(portalRedirect("setuware.in", "/administrator")).toBeNull();
    expect(portalRedirect("localhost:3000", "/admin")).toBeNull();
    expect(portalRedirect(null, "/admin")).toBeNull();
  });
});
