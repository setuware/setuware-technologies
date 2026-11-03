import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import type { Post } from "@/lib/posts";
import { getPublishedPost, getPublishedPosts } from "@/lib/cms/public";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { PostBody } from "@/components/blog/blocks";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { NewsletterForm } from "@/components/interactive/newsletter-form";

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((post) => ({ slug: post.slug }));
}

/** Same category first, then the newest. */
function relatedFrom(all: readonly Post[], current: Post, limit: number): Post[] {
  return all
    .filter((post) => post.slug !== current.slug)
    .sort((a, b) => Number(b.category === current.category) - Number(a.category === current.category))
    .slice(0, limit);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = (await getPublishedPost(slug))?.post;
  if (!post) {
    return pageMetadata({
      title: "Not found",
      description: "",
      path: "/blog",
      noIndex: true,
    });
  }

  return pageMetadata({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.date,
    image: {
      url: post.cover.src,
      width: post.cover.width,
      height: post.cover.height,
      alt: post.cover.alt,
    },
  });
}

/**
 * `params` is read inside a Suspense boundary so navigations render the shell
 * instantly. Every known slug is prerendered by `generateStaticParams`, so the
 * fallback only ever shows on the way to a 404.
 */
export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
      <PostArticle params={params} />
    </Suspense>
  );
}

async function PostArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getPublishedPost(slug);
  if (!found) notFound();
  const { post, blocks } = found;

  const related = relatedFrom(await getPublishedPosts(), post, 3);

  return (
    <>
      <article>
        <header className="relative isolate overflow-hidden border-b border-border bg-[linear-gradient(180deg,#f6f9fc_0%,#ffffff_100%)] pb-12 pt-28 dark:bg-[linear-gradient(180deg,#0b0e18_0%,#070910_100%)] md:pt-36">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -left-[10%] -top-[20%] h-[60%] w-[55%] rounded-full bg-[#00a1c6]/[0.10] blur-3xl" />
            <div className="absolute -right-[10%] top-[10%] h-[50%] w-[45%] rounded-full bg-[#3b82f6]/[0.08] blur-3xl" />
          </div>

          <div className="container-page relative">
            <div className="mx-auto max-w-[44rem]">
              <Link
                href="/blog"
                className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3" aria-hidden />
                All articles
              </Link>

              <Badge className="mt-5">{post.category}</Badge>

              <h1 className="mt-4 text-3xl font-semibold leading-[1.14] text-foreground sm:text-[2.6rem]">
                {post.title}
              </h1>
              <p className="mt-4 text-[1.05rem] leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>

              <div className="mt-7 flex items-center gap-3 border-t border-border pt-6">
                <span
                  aria-hidden
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00a1c6,#3b82f6)] text-xs font-semibold text-white"
                >
                  {post.author.initials}
                </span>
                <span className="text-sm">
                  <span className="block font-medium text-foreground">{post.author.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {post.author.role} · <time dateTime={post.date}>{formatDate(post.date)}</time> ·{" "}
                    {post.readingMinutes} min read
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="container-page relative mt-10 md:mt-12">
            <div className="relative mx-auto aspect-[3/2] max-w-5xl overflow-hidden rounded-card border border-border bg-background-subtle shadow-ambient sm:aspect-[16/9] lg:aspect-[2/1]">
              <Image
                src={post.cover.src}
                unoptimized={post.cover.src.startsWith("/media/")}
                alt={post.cover.alt}
                fill
                fetchPriority="high"
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="object-cover object-[50%_35%]"
              />
            </div>
          </div>
        </header>

        <Section className="py-14 md:py-20">
          {/* Same column as the header: 44rem is roughly 68ch at the body size. */}
          <div className="container-page">
            <div className="mx-auto max-w-[44rem]">
              <PostBody blocks={blocks} />

              <div className="mt-14 flex flex-col gap-5 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#00a1c6,#3b82f6)] text-sm font-semibold text-white"
                  >
                    {post.author.initials}
                  </span>
                  <span className="text-sm leading-tight">
                    <span className="block text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Written by
                    </span>
                    <span className="mt-1 block font-semibold text-foreground">
                      {post.author.name}
                    </span>
                    <span className="block text-muted-foreground">{post.author.role}</span>
                  </span>
                </div>
                <Link
                  href="/blog"
                  className="group inline-flex items-center gap-1.5 text-sm font-semibold text-setu"
                >
                  <ArrowLeft
                    className="size-3.5 transition-transform group-hover:-translate-x-0.5"
                    aria-hidden
                  />
                  All articles
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </article>

      <Section surface="ink" className="py-16 md:py-20" aria-labelledby="newsletter-heading">
        <div className="container-page grid gap-8 md:grid-cols-[1fr_1fr] md:items-center md:gap-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-setu">
              Newsletter
            </span>
            <h2
              id="newsletter-heading"
              className="mt-3 font-display text-3xl font-semibold leading-[1.15] text-foreground"
            >
              Insights, once a month
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
              Practical articles on technology, design and digital growth, delivered to your inbox.
            </p>
          </div>
          <NewsletterForm source={`post:${post.slug}`} />
        </div>
      </Section>

      {related.length > 0 ? (
        <Section surface="subtle" aria-labelledby="related-heading">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2
                id="related-heading"
                className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
              >
                Related articles
              </h2>
              <Link
                href="/blog"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-setu"
              >
                View all articles
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-ambient transition-[transform,border-color,box-shadow] duration-300 hover:border-setu/50 hover:shadow-glow motion-safe:hover:-translate-y-1"
                  >
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <Image
                        src={item.cover.src}
                unoptimized={item.cover.src.startsWith("/media/")}
                        alt={item.cover.alt}
                        fill
                        sizes="(min-width: 768px) 30vw, 100vw"
                        className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.05]"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2.5 p-6">
                      <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-setu">{item.category}</span>
                        <span aria-hidden>·</span>
                        <time dateTime={item.date}>{formatDate(item.date)}</time>
                      </span>
                      <span className="text-[1.05rem] font-semibold leading-snug text-foreground transition-colors group-hover:text-setu">
                        {item.title}
                      </span>
                      <span className="mt-auto pt-2 text-xs text-muted-foreground">
                        {item.readingMinutes} min read
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.excerpt,
          path: `/blog/${post.slug}`,
          date: post.date,
          author: post.author.name,
          image: post.cover.src,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
    </>
  );
}
