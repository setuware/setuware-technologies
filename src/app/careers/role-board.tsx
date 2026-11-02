"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Briefcase, Clock, MapPin } from "lucide-react";

import type { JobTeam } from "@/lib/careers";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/components/motion/ease";

export interface RoleCard {
  slug: string;
  title: string;
  team: JobTeam;
  location: string;
  type: string;
  experience: string;
  summary: string;
  skills: readonly string[];
}

type Filter = "All" | JobTeam;

/**
 * Open roles with a team filter.
 *
 * Every card is in the server HTML; the filter only hides cards on the
 * client, so crawlers and no-JS visitors still see the full list.
 */
export function RoleBoard({
  roles,
  teams,
}: {
  roles: readonly RoleCard[];
  teams: readonly JobTeam[];
}) {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = filter === "All" ? roles : roles.filter((role) => role.team === filter);
  const options: readonly Filter[] = ["All", ...teams];

  return (
    <div>
      <div
        role="group"
        aria-label="Filter roles by team"
        className="-mx-1 flex flex-wrap gap-2 px-1"
      >
        {options.map((option) => {
          const count =
            option === "All" ? roles.length : roles.filter((role) => role.team === option).length;
          const active = filter === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(option)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[0.86rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu",
                active
                  ? "border-setu bg-setu text-white"
                  : "border-border bg-surface text-foreground hover:border-setu/50",
              )}
            >
              {option}
              <span
                className={cn(
                  "rounded-full px-1.5 text-[0.72rem] font-semibold tabular-nums",
                  active ? "bg-white/20 text-white" : "bg-foreground/[0.06] text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-5 text-sm text-muted-foreground" aria-live="polite">
        {filter === "All"
          ? `${roles.length} open roles`
          : `${visible.length} open ${visible.length === 1 ? "role" : "roles"} in ${filter}`}
      </p>

      <motion.ul layout className="mt-4 grid gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((role) => (
            <motion.li
              key={role.slug}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <RoleCardView role={role} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}

function RoleCardView({ role }: { role: RoleCard }) {
  return (
    <Link
      href={`/careers/${role.slug}`}
      className="group flex h-full flex-col rounded-card border border-border bg-surface p-6 shadow-ambient transition-[transform,border-color,box-shadow] duration-300 hover:border-setu/50 hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-setu motion-safe:hover:-translate-y-1 md:p-7"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-setu/25 bg-setu/8 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-setu">
          {role.team}
        </span>
        {role.type === "Internship" ? (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700 dark:text-amber-400">
            Internship
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-xl font-semibold leading-snug text-foreground transition-colors group-hover:text-setu">
        {role.title}
      </h3>
      <p className="mt-2 text-[0.93rem] leading-relaxed text-muted-foreground">{role.summary}</p>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Key skills">
        {role.skills.map((skill) => (
          <li
            key={skill}
            className="rounded-md bg-foreground/[0.05] px-2 py-0.5 text-[0.75rem] font-medium text-foreground/75"
          >
            {skill}
          </li>
        ))}
      </ul>

      <dl className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-5 text-[0.84rem] text-muted-foreground sm:grid-cols-3">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Location</dt>
          <MapPin className="size-3.5 shrink-0 text-setu" aria-hidden />
          <dd>{role.location}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Type</dt>
          <Briefcase className="size-3.5 shrink-0 text-setu" aria-hidden />
          <dd>{role.type}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Experience</dt>
          <Clock className="size-3.5 shrink-0 text-setu" aria-hidden />
          <dd>{role.experience}</dd>
        </div>
      </dl>

      <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-setu">
        View role
        <ArrowRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
