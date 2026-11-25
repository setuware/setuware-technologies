import { caseStudies, services } from "@/lib/content";
import { HOME_DESCRIPTION } from "@/lib/seo";
import { site } from "@/lib/site";

/** Plain-text site summary for AI assistants and answer engines (llmstxt.org). */
export function GET() {
  const url = (path: string) => new URL(path, site.url).toString();
  const body = [
    `# ${site.name}`,
    "",
    `> ${HOME_DESCRIPTION}`,
    "",
    `Based at ${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}, India. Phone ${site.phone}. Email ${site.salesEmail}. Hours: ${site.hours}.`,
    "",
    "## Services",
    ...services.map((service) => `- [${service.name}](${url(`/services/${service.slug}`)}): ${service.summary}`),
    "",
    "## Client projects",
    ...caseStudies.map((study) => `- [${study.client}](${url(`/work/${study.slug}`)}): ${study.summary}`),
    "",
    "## Company",
    `- [About](${url("/about")})`,
    `- [Process](${url("/process")})`,
    `- [Pricing](${url("/pricing")})`,
    `- [Contact](${url("/contact")})`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
