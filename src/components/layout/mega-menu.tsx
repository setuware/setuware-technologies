"use client";

import { useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  FolderKanban,
  Info,
  Mail,
  Newspaper,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ServiceIcon } from "@/components/ui/service-icon";
import { IndustryIcon } from "@/components/ui/industry-icon";
import { EASE_OUT } from "@/components/motion/ease";
import {
  menuItems,
  type NavEntry,
  type NavIcon,
  type NavItem,
  type NavMenu,
  type PageIconName,
} from "@/components/layout/nav-menu-data";

/**
 * Desktop menus for the header bar.
 *
 * Each menu opens on hover (after a short delay, so sweeping the pointer across
 * the bar does not flash panels) and on click, Enter, Space or ArrowDown. Esc
 * closes it and puts focus back on its trigger. Panels stay in the HTML while
 * closed — crawlers and no-JS visitors still see every link — but are `inert`,
 * so they are skipped by Tab and screen readers until opened.
 *
 * Positioning: a `mega` panel's wrapper has no positioned ancestor below the
 * fixed header, so `absolute inset-x-0 top-full` spans the full bar width. A
 * `compact` panel is anchored to its own trigger instead.
 */

/** Delay before a hovered menu opens, so a passing pointer does not open it. */
const OPEN_DELAY = 90;
/** Grace period for the pointer to travel from the trigger into the panel. */
const CLOSE_DELAY = 180;
/** A click this soon after a hover-open is the same intent; keep it open. */
const HOVER_CLICK_GUARD = 450;

const PAGE_ICONS: Record<PageIconName, LucideIcon> = {
  info: Info,
  workflow: Workflow,
  folder: FolderKanban,
  users: Users,
  newspaper: Newspaper,
  mail: Mail,
};

export function NavItemIcon({ icon, compact = false }: { icon: NavIcon; compact?: boolean }) {
  const box = compact ? "size-8 rounded-lg" : "size-9 rounded-[10px]";
  const glyph = compact ? 15 : 17;
  if (icon.kind === "service") {
    return <ServiceIcon name={icon.name} accent={icon.accent} className={box} size={glyph} />;
  }
  if (icon.kind === "industry") {
    return <IndustryIcon name={icon.name} className={box} size={glyph} />;
  }
  const Icon = PAGE_ICONS[icon.name];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-foreground/[0.05] text-foreground/75 ring-1 ring-inset ring-border",
        box,
      )}
    >
      <Icon size={glyph} strokeWidth={1.9} aria-hidden />
    </span>
  );
}

const panelVariants: Variants = {
  closed: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.16, ease: EASE_OUT },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: EASE_OUT,
      staggerChildren: 0.022,
      delayChildren: 0.04,
    },
  },
};

const itemVariants: Variants = {
  closed: { opacity: 0, y: 6, transition: { duration: 0.12 } },
  open: { opacity: 1, y: 0, transition: { duration: 0.36, ease: EASE_OUT } },
};

export interface DesktopMenusProps {
  entries: readonly NavEntry[];
  openId: string | null;
  onOpenChange: (id: string | null) => void;
  isActive: (href: string) => boolean;
}

export function DesktopMenus({ entries, openId, onOpenChange, isActive }: DesktopMenusProps) {
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const hoverOpenedAt = useRef(0);
  const focusFirstOnOpen = useRef<string | null>(null);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const panels = useRef(new Map<string, HTMLDivElement>());
  const rootRef = useRef<HTMLDivElement>(null);

  const clearTimers = useCallback(() => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const close = useCallback(
    (returnFocus: boolean) => {
      clearTimers();
      if (returnFocus && openId) triggers.current.get(openId)?.focus();
      onOpenChange(null);
    },
    [clearTimers, onOpenChange, openId],
  );

  // Esc and outside clicks only matter while a menu is open.
  useEffect(() => {
    if (!openId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const header = rootRef.current?.closest("header");
      if (header && !header.contains(event.target as Node)) close(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openId, close]);

  // ArrowDown on a trigger opens its menu and moves into it. The panel is
  // `inert` until this render commits, so focus is moved afterwards.
  useEffect(() => {
    if (!openId || focusFirstOnOpen.current !== openId) return;
    focusFirstOnOpen.current = null;
    panels.current.get(openId)?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
  }, [openId]);

  const hoverOpen = (id: string) => {
    clearTimers();
    if (openId === id) return;
    const open = () => {
      hoverOpenedAt.current = Date.now();
      onOpenChange(id);
    };
    // Moving between triggers with a menu already open switches at once.
    if (openId) open();
    else openTimer.current = window.setTimeout(open, OPEN_DELAY);
  };

  const hoverClose = () => {
    clearTimers();
    closeTimer.current = window.setTimeout(() => onOpenChange(null), CLOSE_DELAY);
  };

  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a[href]"));
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (index === -1) return;
    event.preventDefault();
    const next = event.key === "ArrowDown" ? index + 1 : index - 1;
    links[(next + links.length) % links.length]?.focus();
  };

  return (
    <div
      ref={rootRef}
      className="hidden items-center lg:ml-[calc(var(--s)*116)] lg:flex lg:h-[calc(var(--s)*40)] lg:gap-[calc(var(--s)*48)]"
    >
      {entries.map((entry) => {
        if (entry.kind === "link") {
          return (
            <Link
              key={entry.href}
              href={entry.href}
              aria-current={isActive(entry.href) ? "page" : undefined}
              suppressHydrationWarning
              onPointerEnter={(event) => {
                // Sweeping onto a plain link closes whichever menu was open.
                if (event.pointerType === "mouse" && openId) hoverClose();
              }}
              className={cn(
                "inline-flex h-full items-center text-[calc(var(--s)*15)] font-medium leading-[normal] whitespace-nowrap transition-colors",
                isActive(entry.href) ? "text-setu" : "text-foreground hover:text-setu",
              )}
            >
              {entry.label}
            </Link>
          );
        }

        const open = openId === entry.id;
        const active =
          isActive(entry.href) || menuItems(entry).some((item) => isActive(item.href));
        const panelId = `nav-panel-${entry.id}`;

        return (
          <div
            key={entry.id}
            className={cn("flex h-full items-center", entry.layout === "compact" && "relative")}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") hoverOpen(entry.id);
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") hoverClose();
            }}
            onBlur={(event) => {
              // Tabbing out of the trigger and its panel closes it. A null
              // `relatedTarget` (a click on panel padding) is not a move away.
              const next = event.relatedTarget as Node | null;
              if (open && next && !event.currentTarget.contains(next)) onOpenChange(null);
            }}
          >
            <button
              type="button"
              // Active state depends on the pathname, which differs between
              // server and client on the 404 page.
              suppressHydrationWarning
              ref={(node) => {
                if (node) triggers.current.set(entry.id, node);
                else triggers.current.delete(entry.id);
              }}
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => {
                if (open && Date.now() - hoverOpenedAt.current < HOVER_CLICK_GUARD) return;
                clearTimers();
                hoverOpenedAt.current = 0;
                onOpenChange(open ? null : entry.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  focusFirstOnOpen.current = entry.id;
                  if (open) {
                    focusFirstOnOpen.current = null;
                    panels.current.get(entry.id)?.querySelector<HTMLAnchorElement>("a[href]")?.focus();
                  } else {
                    onOpenChange(entry.id);
                  }
                }
              }}
              className={cn(
                "group/nav inline-flex items-center gap-[calc(var(--s)*8)] rounded-sm text-[calc(var(--s)*15)] font-medium leading-[normal] whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-setu/60 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
                active || open ? "text-setu" : "text-foreground hover:text-setu",
              )}
            >
              {entry.label}
              {/*
                9.9 × 10 slot in the design; the lucide glyph only fills the
                middle half of its box, so it is drawn at twice the slot size
                and pulled back in with negative margins.
              */}
              <ChevronDown
                aria-hidden
                strokeWidth={1.8}
                className={cn(
                  "-m-[calc(var(--s)*5)] size-[calc(var(--s)*20)] transition-transform duration-200",
                  open ? "rotate-180" : "group-hover/nav:translate-y-px",
                )}
              />
            </button>

            <MenuPanel
              menu={entry}
              id={panelId}
              open={open}
              isActive={isActive}
              onNavigate={() => close(false)}
              onKeyDown={onPanelKeyDown}
              panelRef={(node) => {
                if (node) panels.current.set(entry.id, node);
                else panels.current.delete(entry.id);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

interface MenuPanelProps {
  menu: NavMenu;
  id: string;
  open: boolean;
  isActive: (href: string) => boolean;
  onNavigate: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  panelRef: (node: HTMLDivElement | null) => void;
}

function MenuPanel({ menu, id, open, isActive, onNavigate, onKeyDown, panelRef }: MenuPanelProps) {
  const mega = menu.layout === "mega";

  return (
    <div
      ref={panelRef}
      id={id}
      // React 19 treats `inert` as a boolean attribute.
      inert={!open}
      onKeyDown={onKeyDown}
      className={cn(
        // The top padding bridges the gap between the trigger and the panel,
        // so the pointer can cross it without the menu closing.
        mega
          ? "absolute inset-x-0 top-full -mt-[calc(var(--s)*18)] pt-[calc(var(--s)*18)]"
          : "absolute left-1/2 top-full w-[calc(var(--s)*600)] -translate-x-1/2 pt-[calc(var(--s)*18)]",
        !open && "pointer-events-none",
      )}
    >
      <motion.div
        role="region"
        aria-label={`${menu.label} menu`}
        initial={false}
        animate={open ? "open" : "closed"}
        variants={panelVariants}
        className={cn(
          "overflow-y-auto overscroll-contain bg-surface text-foreground",
          mega
            ? "max-h-[calc(100dvh-72px)] border-y border-border shadow-[0_24px_48px_-24px_rgb(15_23_42/0.28)]"
            : "rounded-2xl border border-border shadow-[0_24px_48px_-20px_rgb(15_23_42/0.3)]",
        )}
      >
        <div
          className={cn(
            mega
              ? "container-figma grid gap-[calc(var(--s)*40)] py-[calc(var(--s)*32)]"
              : "p-[calc(var(--s)*20)]",
            mega && menu.feature && "grid-cols-[1fr_calc(var(--s)*330)]",
          )}
        >
          <div>
            <div
              className={cn(
                "grid",
                mega ? "gap-[calc(var(--s)*32)]" : "gap-[calc(var(--s)*16)]",
              )}
              style={{ gridTemplateColumns: `repeat(${menu.columns.length}, minmax(0, 1fr))` }}
            >
              {menu.columns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex flex-col gap-[calc(var(--s)*24)]">
                  {column.groups.map((group) => (
                    <div key={group.title}>
                      <motion.div variants={itemVariants} className="px-[calc(var(--s)*10)]">
                        <p className="text-[calc(var(--s)*11)] font-semibold uppercase tracking-[0.16em] text-foreground/50">
                          {group.title}
                        </p>
                        {group.caption ? (
                          <p className="mt-[calc(var(--s)*3)] text-[calc(var(--s)*12.5)] text-muted-foreground">
                            {group.caption}
                          </p>
                        ) : null}
                      </motion.div>
                      <ul className="mt-[calc(var(--s)*10)] flex flex-col gap-[calc(var(--s)*2)]">
                        {group.items.map((item) => (
                          <motion.li key={item.href} variants={itemVariants}>
                            <MenuLink item={item} active={isActive(item.href)} onNavigate={onNavigate} />
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {menu.footer ? (
              <motion.div
                variants={itemVariants}
                className="mt-[calc(var(--s)*24)] flex items-center justify-between gap-6 border-t border-border px-[calc(var(--s)*10)] pt-[calc(var(--s)*18)]"
              >
                <Link
                  href={menu.footer.href}
                  onClick={onNavigate}
                  className="group/all inline-flex items-center gap-2 rounded-sm text-[calc(var(--s)*14)] font-semibold text-setu transition-colors hover:text-setu-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-setu/60"
                >
                  {menu.footer.label}
                  <ArrowRight
                    aria-hidden
                    className="size-[calc(var(--s)*14)] transition-transform duration-200 group-hover/all:translate-x-0.5"
                  />
                </Link>
                {menu.footer.hint ? (
                  <p className="text-[calc(var(--s)*12.5)] text-muted-foreground">{menu.footer.hint}</p>
                ) : null}
              </motion.div>
            ) : null}
          </div>

          {mega && menu.feature ? (
            <motion.aside
              variants={itemVariants}
              className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-[#05070d] p-[calc(var(--s)*24)] text-white"
            >
              {menu.feature.image ? (
                <Image
                  src={menu.feature.image}
                  alt=""
                  fill
                  sizes="330px"
                  className="-z-20 object-cover opacity-80"
                />
              ) : null}
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,7,13,0.05)_0%,rgba(5,7,13,0.55)_45%,rgba(5,7,13,0.94)_100%)]"
              />
              <p className="text-[calc(var(--s)*11)] font-semibold uppercase tracking-[0.16em] text-white/70">
                {menu.feature.eyebrow}
              </p>
              <p className="mt-[calc(var(--s)*8)] font-display text-[calc(var(--s)*21)] font-semibold leading-tight tracking-[-0.02em]">
                {menu.feature.title}
              </p>
              <p className="mt-[calc(var(--s)*6)] text-[calc(var(--s)*13.5)] leading-relaxed text-white/75">
                {menu.feature.body}
              </p>
              <div className="mt-[calc(var(--s)*18)] flex flex-wrap items-center gap-x-[calc(var(--s)*16)] gap-y-2">
                <Link
                  href={menu.feature.primary.href}
                  onClick={onNavigate}
                  className="inline-flex h-[calc(var(--s)*40)] items-center justify-center gap-2 rounded-full bg-white px-[calc(var(--s)*18)] text-[calc(var(--s)*13.5)] font-semibold text-[#05070d] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  {menu.feature.primary.label}
                  <ArrowRight aria-hidden className="size-[calc(var(--s)*14)]" />
                </Link>
                {menu.feature.secondary ? (
                  <Link
                    href={menu.feature.secondary.href}
                    onClick={onNavigate}
                    className="text-[calc(var(--s)*13.5)] font-medium text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    {menu.feature.secondary.label}
                  </Link>
                ) : null}
              </div>
            </motion.aside>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}

function MenuLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      suppressHydrationWarning
      className={cn(
        "group/item -mx-[calc(var(--s)*2)] block rounded-lg px-[calc(var(--s)*10)] py-[calc(var(--s)*8)] transition-colors hover:bg-foreground/[0.035] focus-visible:bg-foreground/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-setu/50",
      )}
    >
      <span
        className={cn(
          "flex items-center gap-1.5 text-[calc(var(--s)*14.5)] font-medium leading-snug",
          active ? "text-setu" : "text-foreground",
        )}
      >
        {item.label}
        <ArrowRight
          aria-hidden
          className="size-[calc(var(--s)*13)] -translate-x-1 opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100"
        />
      </span>
      {item.description ? (
        <span className="mt-[calc(var(--s)*1)] block text-[calc(var(--s)*12.5)] leading-snug text-muted-foreground">
          {item.description}
        </span>
      ) : null}
    </Link>
  );
}
