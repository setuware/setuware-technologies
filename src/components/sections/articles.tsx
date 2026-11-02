import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { postsByDate, type Post } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { TextReveal } from "@/components/motion/text-reveal";
import { FadeUp, ImageReveal, Magnetic } from "@/components/motion/primitives";

/** Slow expo-out zoom shared by every card image on hover. */
const IMAGE_HOVER =
  "object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-focus-visible:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100";

/**
 * Zero-width slot after the title, so the arrow can slide in on hover without
 * reflowing the line it sits on.
 */
function TitleArrow() {
  return (
    <span aria-hidden className="relative inline-block w-0 align-middle">
      <ArrowUpRight className="absolute left-1.5 top-1/2 size-[1.05em] -translate-x-2 -translate-y-1/2 opacity-0 transition-[translate,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" />
    </span>
  );
}

function ArticleCard({
  post,
  lead = false,
  delay = 0,
}: {
  post: Post;
  lead?: boolean;
  delay?: number;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col gap-4 rounded-[1rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <ImageReveal
        delay={delay}
        className={
          lead
            ? "relative aspect-[16/10] rounded-[1rem]"
            : "relative aspect-[4/3] rounded-[1rem]"
        }
      >
        {/* ImageReveal's inner layer is unpositioned; `fill` needs a relative parent. */}
        <div className="relative size-full">
          <Image
            src={post.cover.src}
            alt={post.cover.alt}
            fill
            sizes={lead ? "(min-width: 768px) 32rem, 90vw" : "(min-width: 768px) 20rem, 90vw"}
            className={IMAGE_HOVER}
          />
        </div>
      </ImageReveal>
      <FadeUp delay={delay + 0.2} y={18}>
        <h3
          className={
            lead
              ? "text-[0.98rem] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary"
              : "text-[0.9rem] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary"
          }
        >
          {post.title}
          <TitleArrow />
        </h3>
        <time dateTime={post.date} className="mt-2 block text-[11px] text-muted-foreground">
          {formatDate(post.date)}
        </time>
      </FadeUp>
    </Link>
  );
}

/**
 * "Articles & insights".
 *
 * One lead article at double width with two beside it, mirroring the design.
 * Only the lead image is sized large; the rest are served at card width so a
 * phone never downloads a desktop-sized asset. Images wipe up into place one
 * after another; titles follow them.
 */
export function Articles() {
  const [lead, ...rest] = postsByDate.slice(0, 3);

  return (
    <section id="blog" aria-labelledby="articles-title" className="bg-background py-20 md:py-24">
      <div className="container-page">
        <TextReveal
          id="articles-title"
          className="text-center font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]"
        >
          Articles &amp; insights
        </TextReveal>
        <FadeUp delay={0.2} y={18}>
          <p className="mx-auto mt-4 max-w-xl text-center text-[0.92rem] leading-relaxed text-muted-foreground">
            Perspectives on technology, design and digital growth from our
            team.
          </p>
        </FadeUp>

        <div className="mt-12 grid gap-6 md:grid-cols-[1.25fr_1fr_1fr]">
          <ArticleCard post={lead} lead />
          {rest.map((post, index) => (
            <ArticleCard
              key={post.slug}
              post={post}
              delay={(index + 1) * 0.12}
            />
          ))}
        </div>

        <FadeUp delay={0.3} className="mt-12 flex justify-center">
          <Magnetic strength={0.25}>
            <ButtonLink
              href="/blog"
              className="rounded-full bg-foreground text-background shadow-none hover:bg-foreground/85"
            >
              View all articles
            </ButtonLink>
          </Magnetic>
        </FadeUp>
      </div>
    </section>
  );
}
