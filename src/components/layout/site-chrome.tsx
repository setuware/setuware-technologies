"use client";

import { usePathname } from "next/navigation";

/**
 * The public site's header, footer and floating widgets. The admin portal has
 * its own shell, so on /admin only the page itself renders.
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
  const admin = usePathname()?.startsWith("/admin") ?? false;
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
