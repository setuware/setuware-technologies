"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CaseStudyCard {
  slug: string;
  client: string;
  sector: string;
  title: string;
  summary: string;
  year: string;
  accent: readonly [string, string];
  services: readonly { slug: string; name: string }[];
  results: readonly { label: string; value: string }[];
}

type Filter = { kind: "all" } | { kind: "service"; value: string } | { kind: "sector"; value: string };

/**
 * Case-study grid with service and industry filters.
 *
 * Every card is in the server HTML; filtering only hides cards on the client,
 * so crawlers and no-JS visitors still see the full list.
 */
export function CaseStudyGrid({ studies }: { studies: readonly CaseStudyCard[] }) {
  const [filter, setFilter] = useState<Filter>({ kind: "all" });

  const serviceOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const study of studies) {
      for (const service of study.services) seen.set(service.slug, service.name);
    }
    return [...seen].map(([slug, name]) => ({ slug, name }));
  }, [studies]);

  const sectorOptions = useMemo(
    () => [...new Set(studies.map((study) => study.sector))],
    [studies],
  );

  const visible = studies.filter((study) => {
    if (filter.kind === "service") return study.services.some((s) => s.slug === filter.value);
    if (filter.kind === "sector") return study.sector === filter.value;
    return true;
  });

  const isActive = (candidate: Filter) =>
    candidate.kind === filter.kind &&
    (candidate.kind === "all" || (filter.kind !== "all" && candidate.value === filter.value));

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-card border border-border bg-surface p-4 md:p-5">
        <FilterRow label="By service">
          <Chip active={isActive({ kind: "all" })} onClick={() => setFilter({ kind: "all" })}>
            All projects
          </Chip>
          {serviceOptions.map((option) => (
            <Chip
              key={option.slug}
              active={isActive({ kind: "service", value: option.slug })}
              onClick={() => setFilter({ kind: "service", value: option.slug })}
            >
              {option.name}
            </Chip>
          ))}
        </FilterRow>
        <FilterRow label="By industry">
          {sectorOptions.map((sector) => (
            <Chip
              key={sector}
              active={isActive({ kind: "sector", value: sector })}
              onClick={() => setFilter({ kind: "sector", value: sector })}
            >
              {sector}
            </Chip>
          ))}
        </FilterRow>
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        Showing {visible.length} of {studies.length} case studies
      </p>

      <motion.div layout className="mt-4 grid gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((study) => (
            <motion.div
              key={study.slug}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <StudyCard study={study} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <span className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-[0.82rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu",
        active
          ? "border-setu bg-setu text-white"
          : "border-border bg-background text-foreground hover:border-setu/50",
      )}
    >
      {children}
    </button>
  );
}

function StudyCard({ study }: { study: CaseStudyCard }) {
  return (
    <Link
      href={`/work/${study.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-ambient transition-[transform,border-color,box-shadow] duration-300 hover:border-setu/50 hover:shadow-glow motion-safe:hover:-translate-y-1"
    >
      <div
        className="relative h-40 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, ${study.accent[0]}, ${study.accent[1]})`,
        }}
      >
        <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
        <div className="absolute inset-x-0 top-0 flex flex-wrap gap-1.5 p-5">
          <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            {study.sector}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
          <span className="font-display text-xl font-semibold text-white">{study.client}</span>
          <span className="rounded-full bg-white/18 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            {study.year}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6 md:p-7">
        <div className="flex flex-wrap gap-1.5">
          {study.services.map((service) => (
            <span
              key={service.slug}
              className="rounded-full border border-setu/25 bg-setu/8 px-2.5 py-0.5 text-[11px] font-medium text-setu"
            >
              {service.name}
            </span>
          ))}
        </div>
        <h2 className="text-xl font-semibold leading-snug text-foreground">{study.title}</h2>
        <p className="text-[0.95rem] leading-relaxed text-muted-foreground">{study.summary}</p>

        <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-4">
          {study.results.map((metric) => (
            <div key={metric.label} className="flex flex-col-reverse">
              <dt className="text-[11px] leading-tight text-muted-foreground">{metric.label}</dt>
              <dd className="font-display text-base font-semibold text-foreground">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>

        <span className="inline-flex items-center gap-1 text-sm font-medium text-setu">
          View case study
          <ArrowUpRight
            className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
