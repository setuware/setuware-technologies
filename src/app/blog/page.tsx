import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

import type { Post } from "@/lib/posts";
import { getPublishedPosts } from "@/lib/cms/public";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { formatDate } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/ui/section";
import { FadeUp } from "@/components/motion/primitives";
import { NewsletterForm } from "@/components/interactive/newsletter-form";

export const metadata = pageMetadata({
  title: "Blog: Web Development, SEO & Software Insights",
  description:
    "Articles on websites, e-commerce, apps, SEO, hosting and project planning from the Setuware Technologies team, written for business leaders.",
  path: "/blog",
});

export default async function BlogPage() {
  const [lead, ...rest] = await getPublishedPosts();

  return (
    <>
      <PageHero
        video="blog"
        eyebrow="Blog"
        title="Articles and insights"
        description="Perspectives on technology, design and digital growth, drawn from our project experience."
      />

      {lead ? (
        <Section surface="tint" className="py-14 md:py-20" aria-labelledby="featured-heading">
          <div className="container-page">
            <h2
              id="featured-heading"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-setu"
            >
              Latest article
            </h2>
            <FadeUp y={20} className="mt-6">
              <Link
                href={`/blog/${lead.slug}`}
                className="group grid overflow-hidden rounded-card border border-border bg-surface shadow-ambient transition-[border-color,box-shadow] duration-300 hover:border-setu/50 hover:shadow-glow lg:grid-cols-[1.25fr_1fr]"
              >
                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[26rem]">
                  <Image
                    src={lead.cover.src}
                    unoptimized={lead.cover.src.startsWith("/media/")}
                    alt={lead.cover.alt}
                    fill
                    priority
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.04]"
                  />
                </div>

                <div className="flex flex-col gap-4 p-7 md:p-10">
                  <PostMeta post={lead} />
                  <h3 className="font-display text-2xl font-semibold leading-snug text-foreground transition-colors group-hover:text-setu sm:text-[1.9rem] sm:leading-[1.2]">
                    {lead.title}
                  </h3>
                  <p className="text-[1rem] leading-relaxed text-muted-foreground">{lead.excerpt}</p>
                  <div className="mt-auto flex items-center justify-between gap-4 border-t border-border pt-5">
                    <Author post={lead} />
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-setu">
                      Read article
                      <ArrowRight
                        className="size-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </FadeUp>
          </div>
        </Section>
      ) : null}

      {rest.length > 0 ? (
        <Section aria-labelledby="more-heading">
          <div className="container-page">
            <h2
              id="more-heading"
              className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
            >
              More articles
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post, index) => (
                <li key={post.slug}>
                  <Reveal delay={index * 70} className="h-full">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-ambient transition-[transform,border-color,box-shadow] duration-300 hover:border-setu/50 hover:shadow-glow motion-safe:hover:-translate-y-1"
                    >
                      <div className="relative aspect-[3/2] overflow-hidden">
                        <Image
                          src={post.cover.src}
                    unoptimized={post.cover.src.startsWith("/media/")}
                          alt={post.cover.alt}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.05]"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-6">
                        <PostMeta post={post} />
                        <h3 className="text-[1.1rem] font-semibold leading-snug text-foreground transition-colors group-hover:text-setu">
                          {post.title}
                        </h3>
                        <p className="text-[0.93rem] leading-relaxed text-muted-foreground">
                          {post.excerpt}
                        </p>
                        <div className="mt-auto border-t border-border pt-4">
                          <Author post={post} />
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      <Section surface="dots" className="py-16 md:py-20" aria-labelledby="newsletter-heading">
        <div className="container-page">
          <div className="mx-auto grid max-w-4xl gap-6 rounded-card border border-border bg-surface/90 p-7 shadow-ambient backdrop-blur md:grid-cols-[1fr_1.1fr] md:items-center md:gap-10 md:p-10">
            <div>
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-setu/10 text-setu ring-1 ring-inset ring-setu/15">
                <Mail className="size-5" aria-hidden />
              </span>
              <h2
                id="newsletter-heading"
                className="mt-4 font-display text-2xl font-semibold text-foreground"
              >
                Insights, once a month
              </h2>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
                Practical articles on technology, design and digital growth.
              </p>
            </div>
            <NewsletterForm source="blog-index" />
          </div>
        </div>
      </Section>

      <JsonLd data={breadcrumbJsonLd([{ name: "Blog", path: "/blog" }])} />
    </>
  );
}

function PostMeta({ post }: { post: Post }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
      <span className="rounded-full border border-setu/25 bg-setu/8 px-2.5 py-0.5 font-semibold text-setu">
        {post.category}
      </span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden>·</span>
      <span>{post.readingMinutes} min read</span>
    </span>
  );
}

function Author({ post }: { post: Post }) {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2f56d8,#3b82f6)] text-[11px] font-semibold text-white"
      >
        {post.author.initials}
      </span>
      <span className="text-[0.82rem] leading-tight">
        <span className="block font-medium text-foreground">{post.author.name}</span>
        <span className="block text-muted-foreground">{post.author.role}</span>
      </span>
    </span>
  );
}
