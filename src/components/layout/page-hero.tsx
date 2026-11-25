import Image from "next/image";

import type { PageVideoKey } from "@/lib/media";
import { cn } from "@/lib/utils";
import { CircuitLines } from "@/components/sections/home/shared";

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
  /** Picks the page's header photograph. */
  video?: PageVideoKey;
  /** Overrides the header photograph. */
  image?: string;
}

/** Full-HD header photographs (2400px+, Pexels free licence). */
const PAGE_PHOTOS: Record<PageVideoKey, string> = {
  about: "/images/team/team-group.jpg",
  services: "/images/photos/service-web.jpg",
  process: "/images/team/team-workshop.jpg",
  work: "/images/photos/case-study-feature.jpg",
  contact: "/images/team/client-meeting.jpg",
  pricing: "/images/photos/article-automation.jpg",
  industries: "/images/photos/skills-gap.jpg",
  careers: "/images/team/team-portrait.jpg",
  blog: "/images/photos/article-growth.jpg",
};

const DEFAULT_PHOTO = "/images/photos/hero-backdrop.jpg";

/**
 * Shared header for every inner page: a full-width photograph under a navy
 * scrim, in the same corporate style as the home-page hero.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  align = "left",
  children,
  above,
  className,
  video,
  image,
}: PageHeroProps) {
  const src = image ?? (video ? PAGE_PHOTOS[video] : DEFAULT_PHOTO);
  const centered = align === "center";
  return (
    <section
      className={cn(
        // `dark` flips the semantic colour tokens inside, so breadcrumbs and
        // buttons passed as children read light on the photograph.
        "dark relative isolate overflow-hidden bg-[#0b1130] pb-16 pt-32 text-foreground md:pb-24 md:pt-44",
        className,
      )}
    >
      <Image src={src} alt="" fill preload sizes="100vw" className="-z-20 object-cover" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(8,14,44,0.94)_0%,rgba(12,26,82,0.82)_45%,rgba(20,44,130,0.45)_100%)]"
      />
      <CircuitLines className="absolute -right-10 bottom-0 -z-10 hidden w-[34rem] text-white/[0.08] lg:block" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1 bg-[linear-gradient(90deg,#2f56d8,#3b82f6_50%,#06b6d4)]"
      />

      <div className="container-page relative">
        {above}
        <div className={cn("flex flex-col gap-4", centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl")}>
          {eyebrow ? (
            <p
              className={cn(
                "inline-flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-[#9db4ff]",
                centered && "justify-center",
              )}
            >
              <span aria-hidden className="h-px w-8 bg-[#9db4ff]" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-[2.3rem] font-bold leading-[1.1] tracking-[-0.02em] text-white sm:text-5xl lg:text-[3.5rem]">
            {title}
          </h1>
          {description ? (
            <p className="text-base leading-relaxed text-white/80 md:text-[1.15rem]">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
