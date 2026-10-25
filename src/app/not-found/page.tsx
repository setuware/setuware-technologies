import { NotFoundView } from "@/components/layout/not-found-view";

/**
 * Source of the 404 body the proxy serves for unknown content slugs.
 *
 * Prerendered so the proxy's one-time fetch is a static file read, and marked
 * noindex because nothing should ever link here directly — the 404 a visitor
 * sees keeps the URL they actually requested.
 */
export const metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFoundRoute() {
  return <NotFoundView />;
}
