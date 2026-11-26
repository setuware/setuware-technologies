import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Home, LayoutGrid, MessageSquare } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

const DESTINATIONS = [
  {
    href: "/services",
    Icon: LayoutGrid,
    title: "Services",
    body: "Websites, e-commerce, mobile apps and custom software.",
  },
  {
    href: "/work",
    Icon: BriefcaseBusiness,
    title: "Our work",
    body: "Case studies with the challenge, approach and results.",
  },
  {
    href: "/contact",
    Icon: MessageSquare,
    title: "Contact",
    body: "Discuss your project with our team.",
  },
] as const;

/**
 * Shared 404 body.
 *
 * Rendered both by Next's `not-found.tsx` convention and by the `/not-found`
 * route the proxy rewrites unknown slugs to, so the two can never drift.
 */
export function NotFoundView() {
  return (
    <div className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f6f9fc_0%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#0b0e18_0%,#070910_100%)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-[10%] -top-[10%] h-[60%] w-[55%] rounded-full bg-[#2f56d8]/[0.10] blur-3xl" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[50%] rounded-full bg-[#3b82f6]/[0.08] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_30%,transparent_100%)] dark:bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)]" />
      </div>

      <div className="container-page flex min-h-[70vh] flex-col items-center justify-center pb-24 pt-32 text-center md:pt-40">
        <span className="inline-flex items-center gap-2 rounded-full border border-setu/25 bg-setu/8 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-setu">
          Error 404
        </span>
        <h1 className="mt-6 max-w-2xl font-display text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          The page you requested may have been moved, renamed or removed. Use the links below to
          continue.
        </p>

        <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          <ButtonLink
            href="/"
            size="lg"
            variant="ghost"
            className="rounded-full bg-setu font-semibold text-white hover:bg-setu-dark dark:hover:bg-setu-dark"
          >
            <Home className="size-4" aria-hidden />
            Back to home
          </ButtonLink>
          <ButtonLink href="/contact" size="lg" variant="secondary" className="rounded-full">
            Contact us
          </ButtonLink>
        </div>

        <ul className="mt-14 grid w-full max-w-4xl gap-4 text-left sm:grid-cols-3">
          {DESTINATIONS.map(({ href, Icon, title, body }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-card border border-border bg-surface p-6 shadow-ambient transition-[transform,border-color,box-shadow] duration-300 hover:border-setu/50 hover:shadow-glow motion-safe:hover:-translate-y-1"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-setu/10 text-setu ring-1 ring-inset ring-setu/15">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="mt-5 font-semibold text-foreground">{title}</span>
                <span className="mt-1.5 text-[0.92rem] leading-relaxed text-muted-foreground">
                  {body}
                </span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-setu">
                  Visit page
                  <ArrowRight
                    className="size-3.5 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-muted-foreground">
          Press{" "}
          <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-sans text-xs">
            ⌘K
          </kbd>{" "}
          on any page to search the site.
        </p>
      </div>
    </div>
  );
}
