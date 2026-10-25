import * as React from "react";

import { cn } from "@/lib/utils";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** `subtle` alternates the background so long pages stay readable. */
  surface?: "default" | "subtle";
}

export function Section({
  className,
  surface = "default",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative py-20 md:py-28",
        surface === "subtle" && "bg-background-subtle",
        className,
      )}
      {...props}
    />
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
  return (
    <div
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
    </div>
  );
}
