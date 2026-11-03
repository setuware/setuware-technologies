"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Command, Menu, Phone, X } from "lucide-react";

import { useScrollLock, useScrolled } from "@/lib/hooks";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme";
import { OPEN_COMMAND_EVENT } from "@/components/layout/command-menu-events";
import { Magnetic, useReducedMotionSafe } from "@/components/motion/primitives";
import { DURATION, EASE_OUT } from "@/components/motion/ease";
import { DesktopMenus } from "@/components/layout/mega-menu";
import type { NavEntry, NavMenu } from "@/components/layout/nav-menu-data";

/**
 * Sticky header.
 *
 * Services, Industries and Company open menus (see `mega-menu.tsx` for the
 * hover, click and keyboard behaviour); everything else is a plain link. The
 * mobile drawer lists the same items in accordion sections.
 *
 * The scroll listener lives in a shared rAF-throttled hook — an `onScroll`
 * prop on the header element would never fire, because the document scrolls,
 * not the header.
 *
 * Motion: the bar slides away while you read down the page and comes back the
 * moment you scroll up (`useAutoHide`). It never hides near the top, while the
 * drawer is open, while focus is inside it, or for reduced-motion visitors.
 */

/** Pixels of scroll travel in one direction before the bar reacts. */
const HIDE_THRESHOLD = 8;
/** The bar always shows above this scroll position. */
const HIDE_AFTER = 160;

function useAutoHide(pinned: boolean): boolean {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  // Where the current scroll direction started, and which way it is going.
  const anchor = useRef(0);
  const goingDown = useRef(true);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (y < HIDE_AFTER) {
      anchor.current = y;
      setHidden(false);
      return;
    }
    const previous = scrollY.getPrevious() ?? y;
    const down = y > previous;
    if (y !== previous && down !== goingDown.current) {
      goingDown.current = down;
      anchor.current = previous;
    }
    const travel = y - anchor.current;
    if (travel > HIDE_THRESHOLD) setHidden(true);
    else if (travel < -HIDE_THRESHOLD) setHidden(false);
  });

  return hidden && !pinned;
}
export interface NavbarProps {
  links: readonly NavEntry[];
}

export function Navbar({ links }: NavbarProps) {
  const pathname = usePathname();
  const scrolled = useScrolled(12);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [focusWithin, setFocusWithin] = useState(false);
  const reduceMotion = useReducedMotionSafe();
  const hidden = useAutoHide(
    mobileOpen || openMenu !== null || focusWithin || Boolean(reduceMotion),
  );
  const megaOpen = links.some(
    (entry) => entry.kind === "menu" && entry.id === openMenu && entry.layout === "mega",
  );
  const menus = links.filter((entry): entry is NavMenu => entry.kind === "menu");
  const plainLinks = links.filter((entry) => entry.kind === "link");

  useScrollLock(mobileOpen);

  // Any navigation closes the drawer. Adjusted during render (React's
  // "storing information from previous renders" pattern) rather than in an
  // effect, so the closed drawer never paints a frame on the new page.
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setMobileOpen(false);
    setOpenMenu(null);
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
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "glass border-b border-border shadow-ambient"
            : "border-b border-transparent bg-background",
        )}
        initial={false}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ duration: hidden ? DURATION.fast : DURATION.base * 0.7, ease: EASE_OUT }}
        // Keyboard users tabbing through the bar must never lose it.
        onFocus={() => setFocusWithin(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setFocusWithin(false);
          }
        }}
      >
        <nav
          className="container-figma flex h-16 items-center justify-between gap-4 md:h-18 lg:h-auto lg:justify-start lg:gap-0 lg:pb-[calc(var(--s)*18)] lg:pt-[calc(var(--s)*14)]"
          aria-label="Main"
        >
          <Logo />

          <DesktopMenus
            entries={links}
            openId={openMenu}
            onOpenChange={setOpenMenu}
            isActive={isActive}
          />

          <div className="flex items-center gap-2 lg:ml-auto lg:items-end lg:gap-[calc(var(--s)*22)]">
            <a
              href={site.phoneHref}
              aria-label={`Call us on ${site.phone}`}
              className="group/phone hidden items-center gap-[calc(var(--s)*10)] rounded-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-setu/60 focus-visible:ring-offset-4 lg:flex"
            >
              {/* Rings on hover; purely decorative. */}
              <span
                aria-hidden
                className="inline-flex size-[calc(var(--s)*34)] items-center justify-center rounded-full bg-setu/10 text-setu transition-colors duration-300 group-hover/phone:bg-setu group-hover/phone:text-white group-focus-visible/phone:bg-setu group-focus-visible/phone:text-white"
              >
                <Phone className="size-[calc(var(--s)*15)] motion-safe:group-hover/phone:animate-[phone-ring_0.9s_ease-in-out] motion-safe:group-focus-visible/phone:animate-[phone-ring_0.9s_ease-in-out]" />
              </span>
              <span aria-hidden className="flex flex-col items-start leading-[normal]">
                <span className="text-[calc(var(--s)*11)] font-medium text-foreground/60">Call us</span>
                {/* Two stacked copies: on hover the dark one rolls up and the
                    cyan one rolls in, with an underline sweeping across. */}
                <span className="relative block overflow-hidden whitespace-nowrap text-[calc(var(--s)*17)] font-bold">
                  <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/phone:-translate-y-full motion-safe:group-focus-visible/phone:-translate-y-full motion-reduce:group-hover/phone:text-setu">
                    {site.phone}
                  </span>
                  <span className="absolute inset-0 block translate-y-full text-setu transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover/phone:translate-y-0 motion-safe:group-focus-visible/phone:translate-y-0">
                    {site.phone}
                  </span>
                </span>
                <span className="mt-[2px] block h-px w-full origin-left scale-x-0 bg-setu transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/phone:scale-x-100 group-focus-visible/phone:scale-x-100" />
              </span>
            </a>

            <ThemeToggle className="hidden sm:inline-flex lg:size-[calc(var(--s)*40)] lg:self-center" />

            <Magnetic strength={0.25} className="hidden sm:block">
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
            </Magnetic>

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
      </motion.header>

      {/* Dims the page under an open mega menu; clicks fall through to the
          outside-click handler, which closes it. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none fixed inset-0 z-40 hidden bg-slate-950/25 transition-opacity duration-300 lg:block",
          megaOpen ? "opacity-100" : "opacity-0",
        )}
      />

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

        <div className="mt-6 flex flex-col divide-y divide-border border-y border-border">
          {menus.map((menu) => {
            const expanded = mobileSection === menu.id;
            const sectionId = `mobile-section-${menu.id}`;
            return (
              <div key={menu.id}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={sectionId}
                  onClick={() => setMobileSection(expanded ? null : menu.id)}
                  className={cn(
                    "flex w-full items-center justify-between px-1 py-3.5 text-left text-[0.98rem] font-semibold",
                    expanded ? "text-setu" : "text-foreground",
                  )}
                >
                  {menu.label}
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      "size-4 text-muted-foreground transition-transform duration-300",
                      expanded && "rotate-180 text-setu",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      id={sectionId}
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32, ease: EASE_OUT }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-4 pb-4">
                        {menu.columns.flatMap((column) => column.groups).map((group) => (
                          <div key={group.title}>
                            <p className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                              {group.title}
                            </p>
                            <ul className="flex flex-col">
                              {group.items.map((item) => (
                                <li key={item.href}>
                                  <Link
                                    href={item.href}
                                    aria-current={isActive(item.href) ? "page" : undefined}
                                    suppressHydrationWarning
                                    className={cn(
                                      "flex items-center gap-3 rounded-xl px-1 py-2 text-[0.93rem]",
                                      isActive(item.href) ? "text-setu" : "text-foreground",
                                    )}
                                  >
                                    {item.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                        {menu.footer ? (
                          <Link
                            href={menu.footer.href}
                            className="inline-flex items-center gap-1.5 px-1 text-sm font-semibold text-setu"
                          >
                            {menu.footer.label}
                            <ArrowRight className="size-3.5" aria-hidden />
                          </Link>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-col">
          {plainLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              suppressHydrationWarning
              className={cn(
                "rounded-xl px-1 py-2.5 text-[0.98rem] font-semibold",
                isActive(item.href) ? "text-setu" : "text-foreground",
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
