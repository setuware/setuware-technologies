import { caseStudies, services } from "./content";
import { industries } from "./industries";
import { posts } from "./posts";

/**
 * Known slugs per dynamic section.
 *
 * Shared by `generateStaticParams` and the proxy, so the set of valid URLs is
 * defined once and the two can never disagree.
 */
export const KNOWN_SLUGS: Record<string, ReadonlySet<string>> = {
  services: new Set(services.map((service) => service.slug)),
  work: new Set(caseStudies.map((study) => study.slug)),
  blog: new Set(posts.map((post) => post.slug)),
  industries: new Set(industries.map((industry) => industry.slug)),
};

/** True when `/<section>/<slug>` is a page we actually publish. */
export function isKnownRoute(section: string, slug: string): boolean {
  return KNOWN_SLUGS[section]?.has(slug) ?? false;
}
