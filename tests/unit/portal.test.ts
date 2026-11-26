import { afterEach, describe, expect, it, vi } from "vitest";

import { adminUrl, routePortal } from "@/lib/portal";

afterEach(() => vi.unstubAllEnvs());

describe("routePortal", () => {
  it("does nothing while PORTAL_URL is unset", () => {
    vi.stubEnv("PORTAL_URL", "");
    expect(routePortal("setuware.in", "/admin/leads")).toEqual({ type: "next" });
    expect(adminUrl("/login")).toBe("https://setuware.in/admin/login");
  });

  describe("with core.setuware.in", () => {
    const portal = () => vi.stubEnv("PORTAL_URL", "https://core.setuware.in/");

    it("moves /admin from the main site to the portal host", () => {
      portal();
      expect(routePortal("setuware.in", "/admin/leads", "?q=1")).toEqual({ type: "redirect", url: "https://core.setuware.in/admin/leads?q=1" });
      expect(routePortal("setuware.in", "/admin")).toEqual({ type: "redirect", url: "https://core.setuware.in/admin" });
      expect(routePortal("setuware.in", "/administration")).toEqual({ type: "next" });
      expect(routePortal("setuware.in", "/blog")).toEqual({ type: "next" });
    });

    it("opens the portal at the root and sends public pages back", () => {
      portal();
      expect(routePortal("core.setuware.in", "/")).toEqual({ type: "redirect", url: "https://core.setuware.in/admin" });
      expect(routePortal("CORE.setuware.in", "/admin/login")).toEqual({ type: "next" });
      expect(routePortal("core.setuware.in", "/admin-sw.js")).toEqual({ type: "next" });
      expect(routePortal("core.setuware.in", "/api/health")).toEqual({ type: "next" });
      expect(routePortal("core.setuware.in", "/pricing")).toEqual({ type: "redirect", url: "https://setuware.in/pricing" });
      expect(routePortal("core.setuware.in", "/robots.txt")).toEqual({ type: "robots" });
      expect(adminUrl("/login")).toBe("https://core.setuware.in/admin/login");
    });
  });
});
