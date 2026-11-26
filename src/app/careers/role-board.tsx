"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { JobTeam } from "@/lib/careers";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/components/motion/ease";
import { RoleRow, type RoleCard } from "./role-row";

export type { RoleCard };

type Filter = "All" | JobTeam;

/**
 * Open roles with a team filter.
 *
 * Every row is in the server HTML; the filter only hides rows on the client,
 * so crawlers and no-JS visitors still see the full list.
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
  const options = (["All", ...teams] as const).filter(
    (option) => option === "All" || roles.some((role) => role.team === option),
  );

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Filter roles by team"
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
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
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[0.86rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f56d8]",
                  active
                    ? "border-transparent bg-[linear-gradient(110deg,#3b6cf6,#1d4ed8)] text-white shadow-[0_10px_24px_-12px_rgba(29,78,216,0.9)]"
                    : "border-[#dfe5f5] bg-white text-[#3b4262] hover:border-[#2f56d8]/40 hover:text-[#2f56d8] dark:border-white/10 dark:bg-surface dark:text-white/75",
                )}
              >
                {option}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-[0.72rem] font-semibold tabular-nums",
                    active ? "bg-white/20 text-white" : "bg-[#2f56d8]/8 text-[#5a6180] dark:bg-white/10 dark:text-white/60",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <p className="shrink-0 text-sm text-[#5a6180] dark:text-white/60" aria-live="polite">
          {filter === "All"
            ? `${roles.length} open ${roles.length === 1 ? "role" : "roles"}`
            : `${visible.length} ${visible.length === 1 ? "role" : "roles"} in ${filter}`}
        </p>
      </div>

      <motion.ul layout className="mt-6 flex flex-col gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((role) => (
            <motion.li
              key={role.slug}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
            >
              <RoleRow role={role} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
