import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Server-renderable button. Hover and press states are CSS only, so this never
 * pulls an animation runtime into a page that just needs a link that looks
 * like a button.
 */
const buttonVariants = cva(
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-[transform,background-color,border-color,box-shadow,color] duration-200 ease-out active:translate-y-px disabled:pointer-events-none disabled:opacity-55 motion-safe:hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-glow hover:bg-brand-700 dark:hover:bg-brand-300",
        secondary:
          "border border-border bg-surface text-foreground hover:border-primary/45 hover:bg-surface-2",
        ghost: "text-foreground hover:bg-surface-2",
        outline:
          "border border-primary/35 bg-transparent text-primary hover:border-primary hover:bg-primary/8",
        gradient:
          "bg-[linear-gradient(100deg,var(--color-brand-600),var(--color-brand-500)_45%,var(--color-accent-500))] text-white shadow-glow hover:brightness-110",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
        md: "h-11 px-5 text-[0.95rem]",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, block, type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, block }), className)}
        {...props}
      />
    );
  },
);

export interface ButtonLinkProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Link>, "href">,
    ButtonVariantProps {
  href: string;
}

/** Same visual treatment for navigation; keeps anchors as anchors for a11y. */
export function ButtonLink({
  className,
  variant,
  size,
  block,
  href,
  ...props
}: ButtonLinkProps) {
  const external = /^(https?:|mailto:|tel:)/.test(href);

  if (external) {
    return (
      <a
        href={href}
        className={cn(buttonVariants({ variant, size, block }), className)}
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      />
    );
  }

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
