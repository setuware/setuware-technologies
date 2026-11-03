"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { caseStudyPhoto } from "@/lib/case-study-photos";
import { cn } from "@/lib/utils";
import { Section } from "@/components/ui/section";

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
    <>
      <Section surface="tint" className="py-10 md:py-12">
        <div className="container-page">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-5">
              <FilterRow label="Service">
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
              <FilterRow label="Industry">
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
            <p
              className="shrink-0 text-sm text-muted-foreground lg:pb-2.5"
              aria-live="polite"
            >
              Showing{" "}
              <span className="font-semibold text-foreground tabular-nums">{visible.length}</span> of{" "}
              {studies.length} case studies
            </p>
          </div>
        </div>
      </Section>

      <Section className="pt-12 md:pt-16">
        <div className="container-page">
          <motion.div layout className="grid gap-6 md:grid-cols-2 lg:gap-8">
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
      </Section>
    </>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={`Filter by ${label.toLowerCase()}`} className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <span className="w-20 shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1 rounded-[1.4rem] border border-border bg-surface/90 p-1 shadow-ambient backdrop-blur">
        {children}
      </div>
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
        "rounded-full px-3.5 py-1.5 text-[0.84rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu",
        active
          ? "bg-setu text-white shadow-sm"
          : "text-foreground/75 hover:bg-foreground/[0.05] hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function StudyCard({ study }: { study: CaseStudyCard }) {
  const photo = caseStudyPhoto(study.slug);
  return (
    <Link
      href={`/work/${study.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-ambient transition-[transform,border-color,box-shadow] duration-300 hover:border-setu/50 hover:shadow-glow motion-safe:hover:-translate-y-1"
    >
      <div
        className="relative aspect-[16/10] overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, ${study.accent[0]}, ${study.accent[1]})`,
        }}
      >
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,13,0.35)_0%,rgba(5,7,13,0)_35%,rgba(5,7,13,0.15)_55%,rgba(5,7,13,0.8)_100%)]"
        />
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

        <dl className="mt-auto grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
          {study.results.map((metric) => (
            <div key={metric.label} className="flex flex-col-reverse justify-end bg-background-subtle px-3.5 py-3">
              <dt className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{metric.label}</dt>
              <dd className="font-display text-base font-semibold text-foreground">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>

        <span className="inline-flex items-center gap-1 text-sm font-semibold text-setu">
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
