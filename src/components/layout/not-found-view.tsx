import Link from "next/link";
import { ArrowRight, Home, Search } from "lucide-react";

import { services } from "@/lib/content";
import { ButtonLink } from "@/components/ui/button";

/**
 * Shared 404 body.
 *
 * Rendered both by Next's `not-found.tsx` convention and by the `/not-found`
 * route the proxy rewrites unknown slugs to, so the two can never drift.
 */
export function NotFoundView() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-mesh opacity-60" aria-hidden />

      <div className="container-page relative flex min-h-[70vh] max-w-2xl flex-col items-center justify-center py-28 text-center">
        <span className="text-gradient font-display text-[5rem] font-semibold leading-none sm:text-[7rem]">
          404
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-foreground sm:text-3xl">
          That page does not exist
        </h1>
        <p className="mt-3 text-[1.02rem] leading-relaxed text-muted-foreground">
          The link may be out of date, or we may have moved something. Here is the
          way back.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" size="lg" variant="gradient">
            <Home className="size-4" aria-hidden />
            Back to home
          </ButtonLink>
          <ButtonLink href="/contact" size="lg" variant="secondary">
            Tell us what you were looking for
          </ButtonLink>
        </div>

        <div className="mt-12 w-full rounded-card border border-border bg-surface p-6 text-left">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Search className="size-4 text-primary" aria-hidden />
            Popular destinations
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {services.slice(0, 4).map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {service.name}
                  <ArrowRight
                    className="size-3 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/estimate"
                className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Instant quote
                <ArrowRight
                  className="size-3 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
            <li>
              <Link
                href="/work"
                className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                Case studies
                <ArrowRight
                  className="size-3 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </li>
          </ul>
          <p className="mt-5 text-xs text-muted-foreground">
            Tip: press{" "}
            <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-sans">
              ⌘K
            </kbd>{" "}
            anywhere on the site to search.
          </p>
        </div>
      </div>
    </div>
  );
}
