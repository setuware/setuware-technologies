"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Calculator,
  FileText,
  Mail,
  Phone,
  Search,
  Wrench,
} from "lucide-react";

import { caseStudies, services } from "@/lib/content";
import { industries } from "@/lib/industries";
import { postsByDate } from "@/lib/posts";
import { useScrollLock } from "@/lib/hooks";
import { mainNav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Kind = "action" | "service" | "industry" | "work" | "post" | "page";

interface Command {
  id: string;
  label: string;
  hint?: string;
  kind: Kind;
  href: string;
  keywords: string;
}

const KIND_META: Record<Kind, { label: string; Icon: typeof Search }> = {
  action: { label: "Actions", Icon: ArrowRight },
  service: { label: "Services", Icon: Wrench },
  industry: { label: "Industries", Icon: Building2 },
  work: { label: "Case studies", Icon: Briefcase },
  post: { label: "Articles", Icon: FileText },
  page: { label: "Pages", Icon: Search },
};

function buildIndex(): Command[] {
  return [
    {
      id: "action-quote",
      label: "Get an instant quote",
      hint: "Price your project in about a minute",
      kind: "action",
      href: "/estimate",
      keywords: "quote price estimate cost budget calculator",
    },
    {
      id: "action-contact",
      label: "Start a project",
      hint: "Tell us what you need",
      kind: "action",
      href: "/contact",
      keywords: "contact enquiry brief start hire",
    },
    {
      id: "action-call",
      label: `Call ${site.phone}`,
      kind: "action",
      href: site.phoneHref,
      keywords: "call phone talk sales",
    },
    {
      id: "action-email",
      label: `Email ${site.email}`,
      kind: "action",
      href: `mailto:${site.email}`,
      keywords: "email write mail",
    },
    ...services.map((service) => ({
      id: `service-${service.slug}`,
      label: service.name,
      hint: service.summary,
      kind: "service" as const,
      href: `/services/${service.slug}`,
      keywords: `${service.name} ${service.summary} ${service.stack.join(" ")}`,
    })),
    ...caseStudies.map((study) => ({
      id: `work-${study.slug}`,
      label: study.title,
      hint: `${study.client} · ${study.sector}`,
      kind: "work" as const,
      href: `/work/${study.slug}`,
      keywords: `${study.title} ${study.client} ${study.sector} ${study.stack.join(" ")}`,
    })),
    ...postsByDate.map((post) => ({
      id: `post-${post.slug}`,
      label: post.title,
      hint: post.category,
      kind: "post" as const,
      href: `/blog/${post.slug}`,
      keywords: `${post.title} ${post.excerpt} ${post.category}`,
    })),
    // After articles: the empty-query list is capped, and industries are
    // found by typing.
    ...industries.map((industry) => ({
      id: `industry-${industry.slug}`,
      label: industry.name,
      hint: industry.summary,
      kind: "industry" as const,
      href: `/industries/${industry.slug}`,
      keywords: `${industry.name} ${industry.summary} ${industry.features.join(" ")}`,
    })),
    ...mainNav.map((item) => ({
      id: `page-${item.href}`,
      label: item.label,
      kind: "page" as const,
      href: item.href,
      keywords: item.label,
    })),
  ];
}

/** Characters of `needle` appear in `haystack` in order, not necessarily adjacent. */
function isSubsequence(needle: string, haystack: string): boolean {
  let index = 0;
  for (const char of needle) {
    index = haystack.indexOf(char, index);
    if (index === -1) return false;
    index += 1;
  }
  return true;
}

/**
 * Relevance score for one command, or `null` when it does not match.
 *
 * Subsequence matching is applied to the label only. Running it across the
 * keyword blob as well matches almost everything — "hosting" would find "Web
 * development" through scattered letters in its description — so keywords get
 * a stricter substring test.
 */
export function scoreCommand(
  query: string,
  command: { label: string; keywords: string },
): number | null {
  const needle = query.trim().toLowerCase();
  if (needle === "") return 0;

  const label = command.label.toLowerCase();
  const keywords = command.keywords.toLowerCase();

  if (label.startsWith(needle)) return 100;
  if (label.includes(needle)) return 80;
  if (keywords.includes(needle)) return 60;
  if (isSubsequence(needle.replace(/\s+/g, ""), label.replace(/\s+/g, ""))) return 40;

  return null;
}

export interface CommandMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenuDialog({ open, onOpenChange }: CommandMenuDialogProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const index = useMemo(() => buildIndex(), []);

  const results = useMemo(() => {
    return index
      .map((command, position) => ({
        command,
        position,
        score: scoreCommand(query, command),
      }))
      .filter(
        (entry): entry is { command: Command; position: number; score: number } =>
          entry.score !== null,
      )
      // Ties keep their authored order, so an empty query shows the curated
      // list rather than an arbitrary one.
      .sort((a, b) => b.score - a.score || a.position - b.position)
      .slice(0, 24)
      .map((entry) => entry.command);
  }, [index, query]);

  const grouped = useMemo(() => {
    const groups = new Map<Kind, Command[]>();
    for (const command of results) {
      const bucket = groups.get(command.kind) ?? [];
      bucket.push(command);
      groups.set(command.kind, bucket);
    }
    return [...groups.entries()];
  }, [results]);

  /** Flat order must match the rendered order for arrow keys to feel right. */
  const flat = useMemo(() => grouped.flatMap(([, items]) => items), [grouped]);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    // Focus after paint so the dialog is in the DOM.
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const go = (command: Command | undefined) => {
    if (!command) return;
    onOpenChange(false);
    if (/^(mailto:|tel:|https?:)/.test(command.href)) {
      window.location.href = command.href;
    } else {
      router.push(command.href);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }
      if (event.key === "ArrowDown" || (event.key === "n" && event.ctrlKey)) {
        event.preventDefault();
        setActiveIndex((current) => (flat.length === 0 ? 0 : (current + 1) % flat.length));
        return;
      }
      if (event.key === "ArrowUp" || (event.key === "p" && event.ctrlKey)) {
        event.preventDefault();
        setActiveIndex((current) =>
          flat.length === 0 ? 0 : (current - 1 + flat.length) % flat.length,
        );
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        go(flat[activeIndex]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // `go` closes over the current result list, so the handler is rebound
    // whenever the selection or the results change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, flat, activeIndex, onOpenChange]);

  // Keep the highlighted row visible during keyboard navigation. Purely a
  // convenience, so it is skipped wherever `scrollIntoView` is unavailable.
  useEffect(() => {
    const active = listRef.current?.querySelector('[data-active="true"]');
    if (active instanceof HTMLElement && typeof active.scrollIntoView === "function") {
      active.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  if (!open) return null;

  let cursor = -1;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Quick search"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search services, work, articles…"
            className="h-14 w-full bg-transparent text-[0.95rem] text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="Search"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden shrink-0 rounded border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:block">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {flat.length === 0 ? (
            <div className="px-3 py-10 text-center text-sm text-muted-foreground">
              <p>
                Nothing matched “{query}”.
              </p>
              <p className="mt-1">
                Try “hosting”, “app”, or{" "}
                <a href="/contact" className="text-primary underline">
                  just ask us
                </a>
                .
              </p>
            </div>
          ) : (
            grouped.map(([kind, items]) => {
              const { label, Icon } = KIND_META[kind];
              return (
                <div key={kind} className="mb-1.5 last:mb-0">
                  <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </div>
                  {items.map((command) => {
                    cursor += 1;
                    const active = cursor === activeIndex;
                    return (
                      <button
                        key={command.id}
                        type="button"
                        data-active={active}
                        onMouseEnter={() => setActiveIndex(flat.indexOf(command))}
                        onClick={() => go(command)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                          active ? "bg-primary/10" : "hover:bg-surface-2",
                        )}
                      >
                        <Icon
                          className={cn(
                            "size-4 shrink-0",
                            active ? "text-primary" : "text-muted-foreground",
                          )}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {command.label}
                          </span>
                          {command.hint ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              {command.hint}
                            </span>
                          ) : null}
                        </span>
                        {active ? (
                          <ArrowRight className="size-3.5 shrink-0 text-primary" aria-hidden />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-surface-2/50 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
          </span>
          <span className="flex items-center gap-3">
            <a href="/estimate" className="inline-flex items-center gap-1 hover:text-foreground">
              <Calculator className="size-3" aria-hidden /> Quote
            </a>
            <a href={site.phoneHref} className="inline-flex items-center gap-1 hover:text-foreground">
              <Phone className="size-3" aria-hidden /> Call
            </a>
            <a href="/contact" className="inline-flex items-center gap-1 hover:text-foreground">
              <Mail className="size-3" aria-hidden /> Contact
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
