import type { MetadataRoute } from "next";

import { caseStudies, services } from "@/lib/content";
import { industries } from "@/lib/industries";
import { posts } from "@/lib/posts";
import { site } from "@/lib/site";
import { currentDateIso } from "@/lib/time";

/**
 * Generated at build time from the same content the pages render, so a new
 * service or post can never be published without appearing here.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = (path: string) => new URL(path, site.url).toString();
  const lastModified = new Date(await currentDateIso());

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { path: "/", priority: 1, changeFrequency: "weekly" },
      { path: "/services", priority: 0.9, changeFrequency: "monthly" },
      { path: "/industries", priority: 0.8, changeFrequency: "monthly" },
      { path: "/work", priority: 0.8, changeFrequency: "monthly" },
      { path: "/process", priority: 0.7, changeFrequency: "monthly" },
      { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
      { path: "/estimate", priority: 0.9, changeFrequency: "monthly" },
      { path: "/about", priority: 0.6, changeFrequency: "yearly" },
      { path: "/careers", priority: 0.5, changeFrequency: "monthly" },
      { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
      { path: "/contact", priority: 0.8, changeFrequency: "yearly" },
      { path: "/status", priority: 0.3, changeFrequency: "weekly" },
      { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
      { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
    ] as const
  ).map((entry) => ({
    url: url(entry.path),
    priority: entry.priority,
    changeFrequency: entry.changeFrequency,
    lastModified,
  }));

  return [
    ...staticRoutes,
    ...services.map((service) => ({
      url: url(`/services/${service.slug}`),
      lastModified,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    ...industries.map((industry) => ({
      url: url(`/industries/${industry.slug}`),
      lastModified,
      priority: 0.7,
      changeFrequency: "monthly" as const,
    })),
    ...caseStudies.map((study) => ({
      url: url(`/work/${study.slug}`),
      lastModified,
      priority: 0.6,
      changeFrequency: "yearly" as const,
    })),
    ...posts.map((post) => ({
      url: url(`/blog/${post.slug}`),
      lastModified: new Date(post.date),
      priority: 0.6,
      changeFrequency: "yearly" as const,
    })),
  ];
}
