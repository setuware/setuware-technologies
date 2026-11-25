import { heroBackdropPoster, heroBackdropSources, pageVideo, type PageVideoKey } from "@/lib/media";
import { cn } from "@/lib/utils";
import { HeroBackdrop } from "@/components/interactive/hero-backdrop";
import { SectionHeading } from "@/components/ui/section";

export interface PageHeroProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** Rendered under the heading — breadcrumbs, badges, buttons. */
  children?: React.ReactNode;
  /** Slot above the heading, used for breadcrumb trails. */
  above?: React.ReactNode;
  className?: string;
  /**
   * Full-bleed background video for the header. The header then renders in
   * the dark theme (light text over a scrim) so copy stays readable.
   */
  video?: PageVideoKey;
}

/**
 * Shared hero for every inner page.
 *
 * Carries the same animated backdrop as the home page, so the motion that
 * makes the landing page feel alive does not stop at the first click. One
 * component means the headline rhythm, spacing and backdrop treatment stay
 * identical across the site.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  align = "center",
  children,
  above,
  className,
  video,
}: PageHeroProps) {
  if (video) {
    const media = pageVideo(video);
    return (
      <section
        className={cn(
          // `dark` flips the semantic colour tokens for everything inside,
          // so headings, breadcrumbs and buttons read light on the footage.
          "dark relative isolate overflow-hidden bg-[#05070d] pb-16 pt-32 text-foreground md:pb-20 md:pt-40",
          className,
        )}
      >
        <HeroBackdrop sources={media.sources} poster={media.poster} tone="dark" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.55)_0%,rgba(5,7,13,0.62)_55%,rgba(5,7,13,0.85)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_80%_20%,rgba(0,161,198,0.18),transparent_70%)]"
        />

        <div className="container-page relative">
          {above}
          <SectionHeading
            as="h1"
            align={align}
            eyebrow={eyebrow}
            title={title}
            description={description}
          />
          {children}
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-border pb-12 pt-28 md:pt-36",
        className,
      )}
    >
      <HeroBackdrop sources={heroBackdropSources()} poster={heroBackdropPoster()} />
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-50" aria-hidden />

      <div className="container-page relative">
        {above}
        <SectionHeading
          as="h1"
          align={align}
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        {children}
      </div>
    </section>
  );
}
