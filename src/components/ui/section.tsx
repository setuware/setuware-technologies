import * as React from "react";

import { FadeUp } from "@/components/motion/primitives";
import { cn } from "@/lib/utils";

export type SectionSurface = "default" | "subtle" | "tint" | "dots" | "grid" | "ink";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * Background treatment. Alternate these down a page so long pages keep a
   * rhythm:
   *  - `default`: plain page background
   *  - `subtle`: flat light tint
   *  - `tint`: cool gradient with soft cyan/blue glows
   *  - `dots`: tint plus a faded dot pattern
   *  - `grid`: white with a faded hairline grid
   *  - `ink`: dark band (brand ink) with glows; text tokens switch to the dark theme
   */
  surface?: SectionSurface;
}

export function Section({
  className,
  surface = "default",
  children,
  ...props
}: SectionProps) {
  const decorated = surface === "tint" || surface === "dots" || surface === "grid" || surface === "ink";
  return (
    <section
      className={cn(
        "relative py-20 md:py-28",
        decorated && "isolate overflow-hidden",
        surface === "subtle" && "bg-background-subtle",
        (surface === "tint" || surface === "dots") &&
          "bg-[linear-gradient(180deg,#f6f9fc_0%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#0b0e18_0%,#070910_100%)]",
        surface === "grid" && "bg-background",
        surface === "ink" && "dark bg-[#05070d] text-foreground",
        className,
      )}
      {...props}
    >
      {decorated ? <SectionDecor surface={surface} /> : null}
      {children}
    </section>
  );
}

/** Decorative layers behind a section; never interactive, hidden from AT. */
function SectionDecor({ surface }: { surface: SectionSurface }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {surface !== "grid" ? (
        <>
          <div
            className={cn(
              "absolute -left-[10%] -top-[20%] h-[60%] w-[55%] rounded-full blur-3xl",
              surface === "ink" ? "bg-[#2f56d8]/20" : "bg-[#2f56d8]/[0.10]",
            )}
          />
          <div
            className={cn(
              "absolute -bottom-[25%] -right-[10%] h-[60%] w-[50%] rounded-full blur-3xl",
              surface === "ink" ? "bg-[#3b82f6]/20" : "bg-[#3b82f6]/[0.08]",
            )}
          />
        </>
      ) : null}
      {surface === "dots" ? (
        <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_35%,transparent_100%)] dark:bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)]" />
      ) : null}
      {surface === "grid" ? (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_30%,#000_30%,transparent_100%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]" />
      ) : null}
      {surface === "ink" ? (
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(180deg,transparent,#000_30%,#000_70%,transparent)]" />
      ) : null}
    </div>
  );
}

export interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as: Tag = "h2",
  className,
}: SectionHeadingProps) {
  // The page h1 is animated by PageHero; section headings fade up on scroll.
  const Root = Tag === "h1" ? "div" : FadeUp;
  return (
    <Root
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </span>
      ) : null}
      <Tag
        className={cn(
          "font-semibold text-foreground",
          Tag === "h1"
            ? "text-4xl leading-[1.08] sm:text-5xl lg:text-6xl"
            : "text-3xl leading-[1.15] sm:text-4xl",
        )}
      >
        {title}
      </Tag>
      {description ? (
        <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      ) : null}
    </Root>
  );
}
