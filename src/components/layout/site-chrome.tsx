"use client";

import { useSelectedLayoutSegment } from "next/navigation";

/**
 * The public site's header, footer and floating widgets. The admin portal has
 * its own shell, so admin routes render only the page itself. This goes by the
 * matched route, not the URL: the portal serves /admin/login at /login.
 */
export function SiteChrome({
  navbar,
  footer,
  widgets,
  children,
}: {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  widgets: React.ReactNode;
  children: React.ReactNode;
}) {
  const admin = useSelectedLayoutSegment() === "admin";
  if (admin) return <main id="main" className="flex-1">{children}</main>;
  return (
    <>
      {navbar}
      <main id="main" className="flex-1">
        {children}
      </main>
      {footer}
      {widgets}
    </>
  );
}
