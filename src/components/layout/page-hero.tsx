import { heroBackdropPoster, heroBackdropSources } from "@/lib/media";
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
}: PageHeroProps) {
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
