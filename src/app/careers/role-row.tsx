import Link from "next/link";
import { ArrowRight, Briefcase, Clock, MapPin } from "lucide-react";

import type { JobTeam } from "@/lib/careers";

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

/** One opening as a job-board row: title and summary, key facts, then the link. */
export function RoleRow({ role, compact = false }: { role: RoleCard; compact?: boolean }) {
  return (
    <Link
      href={`/careers/${role.slug}`}
      className="group relative grid gap-4 rounded-2xl border border-[#e3e8f5] bg-white p-5 shadow-[0_10px_30px_-24px_rgba(15,19,48,0.45)] transition-[border-color,box-shadow,transform] duration-300 hover:border-[#2f56d8]/50 hover:shadow-[0_24px_50px_-28px_rgba(29,78,216,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f56d8] motion-safe:hover:-translate-y-0.5 dark:border-white/10 dark:bg-surface sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center lg:gap-8"
    >
      <span
        aria-hidden
        className="absolute inset-y-5 left-0 w-[3px] origin-top scale-y-0 rounded-r-full bg-[linear-gradient(180deg,#3b6cf6,#1d4ed8)] transition-transform duration-300 group-hover:scale-y-100"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#2f56d8]/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2f56d8] dark:bg-[#7c9bff]/15 dark:text-[#9db4ff]">
            {role.team}
          </span>
          {role.type === "Internship" ? (
            <span className="rounded-full bg-amber-500/12 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700 dark:text-amber-400">
              Internship
            </span>
          ) : null}
        </div>
        <h3 className="mt-3 text-[1.12rem] font-bold leading-snug text-[#0f1330] transition-colors group-hover:text-[#2f56d8] dark:text-white dark:group-hover:text-[#9db4ff]">
          {role.title}
        </h3>
        {compact ? null : (
          <p className="mt-1.5 line-clamp-2 max-w-[46rem] text-[0.93rem] leading-relaxed text-[#5a6180] dark:text-white/65">
            {role.summary}
          </p>
        )}
      </div>

      <dl className="flex flex-wrap gap-x-5 gap-y-2 text-[0.86rem] text-[#5a6180] dark:text-white/65 lg:flex-col lg:gap-1.5">
        <Fact Icon={MapPin} label="Location" value={role.location} />
        <Fact Icon={Briefcase} label="Type" value={role.type} />
        <Fact Icon={Clock} label="Experience" value={role.experience} />
      </dl>

      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2f56d8] dark:text-[#9db4ff] lg:justify-self-end">
        View role
        <span className="inline-flex size-9 items-center justify-center rounded-full border border-[#2f56d8]/25 transition-colors group-hover:border-transparent group-hover:bg-[#2f56d8] group-hover:text-white">
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </span>
    </Link>
  );
}

function Fact({ Icon, label, value }: { Icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <dt className="sr-only">{label}</dt>
      <Icon className="size-3.5 shrink-0 text-[#2f56d8] dark:text-[#9db4ff]" aria-hidden />
      <dd className="min-w-0 break-words lg:whitespace-nowrap">{value}</dd>
    </div>
  );
}
