import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { getPost, posts, relatedPosts } from "@/lib/posts";
import { getPostBody } from "@/lib/post-bodies";
import { articleJsonLd, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { PostBody } from "@/components/blog/blocks";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { NewsletterForm } from "@/components/interactive/newsletter-form";
import { CtaBand } from "@/components/sections/cta-band";
import { DeferredSection } from "@/components/ui/deferred-section";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) {
    return pageMetadata({ title: "Not found", description: "", path: "/blog", noIndex: true });
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
export default function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
      <PostArticle params={params} />
    </Suspense>
  );
}

async function PostArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = relatedPosts(post.slug, 2);

  return (
    <>
      <article>
        <header className="relative overflow-hidden border-b border-border pb-12 pt-28 md:pt-36">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.13]"
            style={{
              backgroundImage: `linear-gradient(135deg, ${post.accent[0]}, ${post.accent[1]})`,
            }}
            aria-hidden
          />

          <div className="container-page relative max-w-3xl">
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
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-brand-600),var(--color-accent-500))] text-xs font-semibold text-white">
                {post.author.initials}
              </span>
              <span className="text-sm">
                <span className="block font-medium text-foreground">
                  {post.author.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {post.author.role} ·{" "}
                  <time dateTime={post.date}>{formatDate(post.date)}</time> ·{" "}
                  {post.readingMinutes} min read
                </span>
              </span>
            </div>
          </div>

          <div className="container-page relative mt-10 max-w-5xl md:mt-12">
            <div className="relative aspect-[3/2] overflow-hidden rounded-card border border-border bg-background-subtle shadow-ambient sm:aspect-[16/9] lg:aspect-[2/1]">
              <Image
                src={post.cover.src}
                alt={post.cover.alt}
                fill
                fetchPriority="high"
                sizes="(min-width: 1024px) 76rem, 100vw"
                className="object-cover object-[50%_35%]"
              />
            </div>
          </div>
        </header>

        <div className="container-page max-w-3xl py-14">
          <PostBody blocks={getPostBody(post.slug)} />

          <div className="mt-14 rounded-card border border-border bg-background-subtle p-6 md:p-7">
            <h2 className="text-lg font-semibold text-foreground">
              Subscribe to our newsletter
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              One article each month on technology, design and digital growth.
            </p>
            <div className="mt-4">
              <NewsletterForm source={`post:${post.slug}`} />
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <Section surface="subtle" className="py-14">
          <div className="container-page max-w-3xl">
            <h2 className="text-lg font-semibold text-foreground">Keep reading</h2>
            <div className="mt-5 flex flex-col gap-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-card border border-border bg-surface p-5 transition-colors hover:border-primary/40"
                >
                  <span>
                    <span className="block text-xs text-muted-foreground">
                      {item.category} · {item.readingMinutes} min
                    </span>
                    <span className="mt-1 block font-medium text-foreground">
                      {item.title}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      <DeferredSection minHeight={380}>
        <CtaBand />
      </DeferredSection>

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
