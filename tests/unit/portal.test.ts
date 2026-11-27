import { describe, expect, it } from "vitest";

import { portalRedirect } from "@/lib/portal";

describe("portalRedirect", () => {
  it("opens the admin from the portal root", () => {
    expect(portalRedirect("core.setuware.in", "/")).toBe("https://core.setuware.in/admin");
  });

  it("serves admin, API and asset paths on the portal", () => {
    for (const path of ["/admin", "/admin/login", "/admin/tasks/4", "/api/health", "/_next/data/x.json", "/media/a.mp4", "/admin-sw.js", "/apple-icon", "/favicon.ico"]) {
      expect(portalRedirect("core.setuware.in", path)).toBeNull();
    }
  });

  it("sends website pages on the portal to the website", () => {
    expect(portalRedirect("core.setuware.in", "/services", "?a=1")).toBe("https://setuware.in/services?a=1");
    expect(portalRedirect("CORE.setuware.in", "/administrator")).toBe("https://setuware.in/administrator");
  });

  it("moves admin traffic on the website to the portal", () => {
    expect(portalRedirect("setuware.in", "/admin/login", "?step=code")).toBe("https://core.setuware.in/admin/login?step=code");
    expect(portalRedirect("www.setuware.in", "/admin")).toBe("https://core.setuware.in/admin");
  });

  it("leaves website pages and other hosts alone", () => {
    expect(portalRedirect("setuware.in", "/")).toBeNull();
    expect(portalRedirect("setuware.in", "/administrator")).toBeNull();
    expect(portalRedirect("localhost:3000", "/admin")).toBeNull();
    expect(portalRedirect(null, "/admin")).toBeNull();
  });
});
