"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Command, Menu, Phone, X } from "lucide-react";

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

  // The home hero is full-bleed dark, so an unscrolled header sits on top of
  // it and needs light type. Every other page opens on a light hero.
  const onDarkHero = pathname === "/" && !scrolled;
  const [mobileOpen, setMobileOpen] = useState(false);

  useScrollLock(mobileOpen);

  // Any navigation closes the drawer.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "glass border-b border-border shadow-ambient"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav
          className="container-page flex h-16 items-center justify-between gap-4 md:h-18"
          aria-label="Main"
        >
          <Logo inverted={onDarkHero} />

          <div className="hidden items-center gap-0.5 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  onDarkHero
                    ? isActive(link.href)
                      ? "text-white"
                      : "text-white/70 hover:text-white"
                    : isActive(link.href)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_EVENT))}
              className={cn(
                "hidden items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors lg:inline-flex",
                onDarkHero
                  ? "border-white/20 bg-white/10 text-white/75 hover:text-white"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              <Command className="size-3.5" aria-hidden />
              <span>Search</span>
              <kbd
                className={cn(
                  "rounded border px-1.5 py-0.5 font-sans text-[10px]",
                  onDarkHero
                    ? "border-white/25 bg-white/10 text-white/80"
                    : "border-border bg-surface-2 text-muted-foreground",
                )}
              >
                ⌘K
              </kbd>
            </button>

            <a
              href={site.phoneHref}
              className={cn(
                "hidden flex-col items-end leading-tight xl:flex",
                onDarkHero ? "text-white" : "text-foreground",
              )}
            >
              <span
                className={cn(
                  "text-[10px]",
                  onDarkHero ? "text-white/55" : "text-muted-foreground",
                )}
              >
                Call us 24/7
              </span>
              <span className="text-[0.82rem] font-semibold">{site.phone}</span>
            </a>

            <ThemeToggle
              className={cn(
                "hidden sm:inline-flex",
                onDarkHero && "border-white/20 bg-white/10",
              )}
              inverted={onDarkHero}
            />

            <ButtonLink
              href="/contact"
              size="sm"
              variant="gradient"
              className="hidden rounded-full sm:inline-flex"
            >
              Start A Project
              <ArrowRight className="size-3.5" aria-hidden />
            </ButtonLink>

            <button
              type="button"
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-lg border lg:hidden",
                onDarkHero
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-border bg-surface text-foreground",
              )}
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
          ].map((item) => (
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
          <ThemeToggle className="self-start sm:hidden" />
          <ButtonLink href="/contact" variant="gradient" block className="rounded-full">
            Start A Project
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
