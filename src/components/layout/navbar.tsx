"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Command, Menu, Phone, X } from "lucide-react";

import { useScrollLock, useScrolled } from "@/lib/hooks";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { ServiceIcon } from "@/components/ui/service-icon";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme";
import { OPEN_COMMAND_EVENT } from "@/components/layout/command-menu-events";
import type { MobileService, NavLink } from "@/components/layout/nav-menu-data";

/**
 * Sticky header.
 *
 * Every destination is a plain link: one click, no hover step, and the whole
 * bar works identically with a keyboard, a touchscreen and a mouse. The
 * mobile drawer carries the same list plus direct service shortcuts.
 *
 * The scroll listener lives in a shared rAF-throttled hook — an `onScroll`
 * prop on the header element would never fire, because the document scrolls,
 * not the header.
 */
export interface NavbarProps {
  links: readonly NavLink[];
  /** Service shortcuts shown in the mobile drawer. */
  services: readonly MobileService[];
}

export function Navbar({ links, services }: NavbarProps) {
  const pathname = usePathname();
  const scrolled = useScrolled(12);
  const [mobileOpen, setMobileOpen] = useState(false);

  useScrollLock(mobileOpen);

  // Any navigation closes the drawer. Adjusted during render (React's
  // "storing information from previous renders" pattern) rather than in an
  // effect, so the closed drawer never paints a frame on the new page.
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      {/*
        Figma 24:2619 — a 72px white bar; the 40px content row sits 14px from
        the top. Every page opens below it (the home hero starts at y 72), so
        the bar is solid from the first paint and only gains the glass
        treatment and a hairline once the page scrolls under it.
      */}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "glass border-b border-border shadow-ambient"
            : "border-b border-transparent bg-background",
        )}
      >
        <nav
          className="container-figma flex h-16 items-center justify-between gap-4 md:h-18 lg:h-auto lg:justify-start lg:gap-0 lg:pb-[calc(var(--s)*18)] lg:pt-[calc(var(--s)*14)]"
          aria-label="Main"
        >
          <Logo />

          <div className="hidden items-center lg:ml-[calc(var(--s)*116)] lg:flex lg:h-[calc(var(--s)*40)] lg:gap-[calc(var(--s)*48)]">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "group/nav inline-flex items-center gap-[calc(var(--s)*8)] text-[calc(var(--s)*15)] font-medium leading-[normal] whitespace-nowrap transition-colors",
                  isActive(link.href)
                    ? "text-setu"
                    : "text-foreground hover:text-setu",
                )}
              >
                {link.label}
                {link.chevron ? (
                  // 9.9 × 10 slot in the design; the lucide glyph only fills
                  // the middle half of its box, so it is drawn at twice the
                  // slot size and pulled back in with negative margins.
                  <ChevronDown
                    aria-hidden
                    strokeWidth={1.8}
                    className="-m-[calc(var(--s)*5)] size-[calc(var(--s)*20)] transition-transform duration-200 group-hover/nav:translate-y-px"
                  />
                ) : null}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 lg:ml-auto lg:items-end lg:gap-[calc(var(--s)*34)]">
            <a
              href={site.phoneHref}
              className="hidden flex-col items-end text-right leading-[normal] text-foreground lg:flex lg:w-[calc(var(--s)*139)]"
            >
              <span className="text-[calc(var(--s)*11)] font-medium text-foreground/60">
                Call us 24/7
              </span>
              <span className="text-[calc(var(--s)*17)] font-bold">{site.phone}</span>
            </a>

            <ThemeToggle className="hidden sm:inline-flex lg:hidden" />

            <ButtonLink
              href="/contact"
              size="sm"
              variant="ghost"
              className="hidden rounded-full bg-setu font-semibold text-white hover:bg-setu-dark sm:inline-flex lg:h-[calc(var(--s)*40)] lg:w-[calc(var(--s)*202)] lg:justify-start lg:gap-[calc(var(--s)*10)] lg:pl-[calc(var(--s)*39)] lg:pr-0 lg:text-[calc(var(--s)*15)] lg:leading-[normal] dark:hover:bg-setu-dark"
            >
              Start A Project
              <ArrowRight
                className="size-3.5 lg:h-[calc(var(--s)*12.5)] lg:w-[calc(var(--s)*13)]"
                strokeWidth={2.4}
                aria-hidden
              />
            </ButtonLink>

            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground lg:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/45 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden
      />
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(21rem,88vw)] flex-col overflow-y-auto border-l border-border bg-surface px-5 pb-8 pt-5 transition-transform duration-300 ease-out lg:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal={mobileOpen}
        aria-label="Site menu"
        // React 19 treats `inert` as a boolean attribute: an empty string
        // is falsy and renders nothing.
        inert={!mobileOpen}
      >
        <div className="flex items-center justify-between">
          <Logo />
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-7 flex flex-col">
          <span className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Services
          </span>
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="flex items-center gap-3 rounded-xl px-1 py-2.5 text-[0.95rem] text-foreground"
            >
              <ServiceIcon
                name={service.icon}
                accent={service.accent}
                className="size-8"
                size={16}
              />
              {service.name}
            </Link>
          ))}
        </div>

        <div className="mt-6 flex flex-col border-t border-border pt-5">
          {[
            { label: "Work", href: "/work" },
            ...links,
            { label: "Service status", href: "/status" },
            { label: "Contact", href: "/contact" },
          ]
            // "Projects" and "Contact" are already in `links`; one entry per page.
            .filter((item, index, all) => all.findIndex((other) => other.href === item.href) === index)
            .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-1 py-2.5 text-[0.95rem] font-medium",
                isActive(item.href) ? "text-primary" : "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-8">
          <div className="flex items-center gap-2">
            <ThemeToggle className="sm:hidden" />
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                window.dispatchEvent(new Event(OPEN_COMMAND_EVENT));
              }}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Command className="size-4" aria-hidden />
              Search
            </button>
          </div>
          <ButtonLink
            href="/contact"
            variant="ghost"
            block
            className="rounded-full bg-setu font-semibold text-white hover:bg-setu-dark dark:hover:bg-setu-dark"
          >
            Start A Project
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
          <ButtonLink href="/estimate" variant="secondary" block className="rounded-full">
            Get instant quote
          </ButtonLink>
          <ButtonLink href={site.phoneHref} variant="secondary" block>
            <Phone className="size-4" aria-hidden />
            {site.phone}
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
