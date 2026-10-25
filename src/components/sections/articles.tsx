import Image from "next/image";
import Link from "next/link";

import { images } from "@/lib/images";
import { postsByDate } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

/** Article slug to its image slot; the data layer stays free of asset paths. */
const ARTICLE_IMAGES = [
  images.articleAutomation,
  images.articleProcesses,
  images.articleGrowth,
] as const;

/**
 * "Articles & insights".
 *
 * One lead article at double width with two beside it, mirroring the design.
 * Only the lead image is sized large; the rest are served at card width so a
 * phone never downloads a desktop-sized asset.
 */
export function Articles() {
  const [lead, ...rest] = postsByDate.slice(0, 3);

  return (
    <section id="blog" className="bg-background py-20 md:py-24">
      <div className="container-page">
        <h2 className="text-center font-display text-3xl font-semibold leading-tight text-foreground sm:text-[2.4rem]">
          Articles &amp; insights
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-[1.25fr_1fr_1fr]">
          <Reveal>
            <Link href={`/blog/${lead.slug}`} className="group flex h-full flex-col gap-4">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1rem]">
                <Image
                  src={ARTICLE_IMAGES[0].src}
                  alt={ARTICLE_IMAGES[0].alt}
                  fill
                  sizes="(min-width: 768px) 32rem, 90vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div>
                <h3 className="text-[0.98rem] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {lead.title}
                </h3>
                <time
                  dateTime={lead.date}
                  className="mt-2 block text-[11px] text-muted-foreground"
                >
                  {formatDate(lead.date)}
                </time>
              </div>
            </Link>
          </Reveal>

          {rest.map((post, index) => (
            <Reveal key={post.slug} delay={(index + 1) * 80}>
              <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col gap-4">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1rem]">
                  <Image
                    src={ARTICLE_IMAGES[index + 1].src}
                    alt={ARTICLE_IMAGES[index + 1].alt}
                    fill
                    sizes="(min-width: 768px) 20rem, 90vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div>
                  <h3 className="text-[0.9rem] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h3>
                  <time
                    dateTime={post.date}
                    className="mt-2 block text-[11px] text-muted-foreground"
                  >
                    {formatDate(post.date)}
                  </time>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <ButtonLink
            href="/blog"
            className="rounded-full bg-foreground text-background shadow-none hover:bg-foreground/85"
          >
            Explore All Articles
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
