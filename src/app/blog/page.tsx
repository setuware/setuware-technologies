import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { postsByDate } from "@/lib/posts";
import { pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/layout/page-hero";
import { CtaBand } from "@/components/sections/cta-band";
import { DeferredSection } from "@/components/ui/deferred-section";

export const metadata = pageMetadata({
  title: "Articles and insights",
  description:
    "Practical guides from Setuware Technologies on websites, online stores, apps, SEO, hosting and pricing a project, written for business owners.",
  path: "/blog",
});

export default function BlogPage() {
  const [lead, ...rest] = postsByDate;

  return (
    <>
      <PageHero
        eyebrow="Articles and insights"
        title="Plain answers for business owners"
        description="What a website should cost, how to keep it fast, when you need an app, and what to ask before you hire anyone. Written from real projects, in plain language."
      />

      <div className="container-page py-16">
        {lead ? (
          <Link
            href={`/blog/${lead.slug}`}
            className="group grid gap-6 overflow-hidden rounded-card border border-border bg-surface shadow-ambient transition-colors hover:border-primary/40 md:grid-cols-[1fr_1.4fr]"
          >
            <div
              className="relative min-h-[12rem]"
              style={{
                backgroundImage: `linear-gradient(135deg, ${lead.accent[0]}, ${lead.accent[1]})`,
              }}
            >
              <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
              <span className="absolute left-5 top-5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
                Latest
              </span>
            </div>

            <div className="flex flex-col gap-3 p-6 md:p-8">
              <span className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-medium text-primary">{lead.category}</span>
                <span aria-hidden>·</span>
                <time dateTime={lead.date}>{formatDate(lead.date)}</time>
                <span aria-hidden>·</span>
                <span>{lead.readingMinutes} min read</span>
              </span>
              <h2 className="text-2xl font-semibold leading-snug text-foreground">
                {lead.title}
              </h2>
              <p className="text-[0.98rem] leading-relaxed text-muted-foreground">
                {lead.excerpt}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-medium text-primary">
                Read the article
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </div>
          </Link>
        ) : null}

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {rest.map((post, index) => (
            <Reveal key={post.slug} delay={index * 70}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex h-full flex-col gap-3 rounded-card border border-border bg-surface p-6 transition-[transform,border-color] duration-300 hover:border-primary/40 motion-safe:hover:-translate-y-1"
              >
                <span
                  className="h-1 w-12 rounded-full"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${post.accent[0]}, ${post.accent[1]})`,
                  }}
                  aria-hidden
                />
                <span className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-primary">{post.category}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </span>
                <h2 className="text-[1.05rem] font-semibold leading-snug text-foreground">
                  {post.title}
                </h2>
                <p className="text-[0.9rem] leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <span className="mt-auto pt-2 text-xs text-muted-foreground">
                  {post.readingMinutes} min read
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <DeferredSection minHeight={380}>
        <CtaBand
          title="Have a question these do not answer?"
          description="Tell us about your business and what you need. The first call is free, and you get a written summary either way."
        />
      </DeferredSection>
    </>
  );
}
