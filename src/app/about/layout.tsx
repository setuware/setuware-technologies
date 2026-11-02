import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

/**
 * Carries the About page's breadcrumb structured data, so the page itself
 * stays purely about its visible content.
 */
export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <JsonLd data={breadcrumbJsonLd([{ name: "About", path: "/about" }])} />
    </>
  );
}
