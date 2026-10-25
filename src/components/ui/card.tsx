import * as React from "react";

import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** Adds a lift-and-glow treatment for clickable cards. */
  interactive?: boolean;
  /** Render as a semantically appropriate element without changing styling. */
  as?: "div" | "article" | "li";
}

export function Card({
  className,
  interactive = false,
  as = "div",
  ...props
}: CardProps) {
  // `as` is constrained to elements that share the generic HTML attribute set,
  // so the single cast here is safe and keeps callers fully typed.
  const Tag = as as React.ElementType;

  return (
    <Tag
      className={cn(
        "relative rounded-card border border-border bg-surface shadow-ambient",
        interactive &&
          "group transition-[transform,border-color,box-shadow] duration-300 ease-out hover:border-primary/40 hover:shadow-glow motion-safe:hover:-translate-y-1",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 md:p-7", className)} {...props} />;
}

export function CardTitle({
  className,
  as: Tag = "h3",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" }) {
  return (
    <Tag
      className={cn("text-lg font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function CardText({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-[0.95rem] leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}
