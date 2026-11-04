"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import { CalendarClock, CheckSquare, Clock3, Link2, Plus } from "lucide-react";

import { moveTaskAction, createTaskAction } from "@/app/admin/work-actions";
import type { FormState } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

import { FormMessage } from "./form-bits";
import { hours, PRIORITY_STYLE } from "./task-format";

export interface BoardTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  project: string;
  due_date: string | null;
  assignee_name: string | null;
  reviewer_name: string | null;
  entity: string | null;
  logged: number;
  estimate_minutes: number | null;
  items_total: number;
  items_done: number;
}

export const COLUMNS = [
  { key: "todo", label: "To do", tone: "bg-slate-400" },
  { key: "in_progress", label: "In progress", tone: "bg-[#2f56d8]" },
  { key: "review", label: "In review", tone: "bg-violet-500" },
  { key: "done", label: "Done", tone: "bg-emerald-500" },
] as const;

function DueBadge({ due, today }: { due: string; today: string }) {
  const overdue = due < today;
  const label = due === today ? "Today" : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${due}T00:00:00Z`));
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold",
        overdue ? "text-red-600 dark:text-red-400" : due === today ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
      )}
    >
      <CalendarClock className="size-3" aria-hidden />
      {overdue ? `Overdue · ${label}` : label}
    </span>
  );
}

export function TaskCard({ task, today, dragging, onDragStart, onMove }: {
  task: BoardTask;
  today: string;
  dragging?: boolean;
  onDragStart?: () => void;
  onMove?: (status: string) => void;
}) {
  const initials = (task.assignee_name ?? "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div
      draggable={Boolean(onDragStart)}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(task.id));
        onDragStart?.();
      }}
      className={cn(
        "group rounded-xl border border-border/80 bg-surface p-3 shadow-[0_1px_2px_rgb(15_23_42/0.05)] transition-[box-shadow,opacity,border-color] hover:border-foreground/20 hover:shadow-[0_8px_20px_-12px_rgb(15_23_42/0.35)]",
        onDragStart && "cursor-grab active:cursor-grabbing",
        dragging && "opacity-40",
      )}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", PRIORITY_STYLE[task.priority])}>{task.priority}</span>
        {task.project ? <span className="truncate rounded-full bg-foreground/[0.05] px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{task.project}</span> : null}
        {task.entity ? <Link2 className="ml-auto size-3.5 text-muted-foreground" aria-label={`Linked ${task.entity}`} /> : null}
      </div>
      <Link href={`/admin/tasks/${task.id}`} className="block text-sm font-semibold leading-snug text-foreground hover:underline" draggable={false}>
        {task.title}
      </Link>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        {task.due_date && task.status !== "done" ? <DueBadge due={task.due_date} today={today} /> : null}
        {task.items_total ? (
          <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", task.items_done === task.items_total ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
            <CheckSquare className="size-3" aria-hidden /> {task.items_done}/{task.items_total}
          </span>
        ) : null}
        {task.reviewer_name && task.status !== "done" ? (
          <span className={cn("text-[11px] font-medium", task.status === "review" ? "text-violet-600 dark:text-violet-300" : "text-muted-foreground")}>
            Review: {task.reviewer_name.split(" ")[0]}
          </span>
        ) : null}
        {task.logged || task.estimate_minutes ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            <Clock3 className="size-3" aria-hidden /> {hours(task.logged)}
            {task.estimate_minutes ? ` / ${hours(task.estimate_minutes)}` : ""}
          </span>
        ) : null}
        <span
          title={task.assignee_name ?? "Unassigned"}
          className={cn(
            "ml-auto inline-flex size-6 items-center justify-center rounded-full text-[10px] font-bold",
            task.assignee_name ? "bg-[linear-gradient(135deg,#2f56d8,#0a8ea6)] text-white" : "border border-dashed border-border text-muted-foreground",
          )}
        >
          {initials || "?"}
        </span>
      </div>
      {onMove ? (
        <select
          aria-label="Move to"
          value={task.status}
          onChange={(event) => onMove(event.target.value)}
          className="mt-2 w-full rounded-lg border border-border bg-surface px-2 py-1 text-xs text-muted-foreground md:hidden"
        >
          {COLUMNS.map((column) => (
            <option key={column.key} value={column.key}>
              {column.label}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}

function QuickAdd({ status }: { status: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createTaskAction, {});
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
      >
        <Plus className="size-3.5" aria-hidden /> Add a task
      </button>
    );
  }
  return (
    <form action={action} className="rounded-xl border border-border bg-surface p-2">
      <input type="hidden" name="quick" value="1" />
      <input type="hidden" name="status" value={status} />
      <input
        name="title"
        autoFocus
        required
        placeholder="What needs doing?"
        aria-label="Task title"
        className="w-full bg-transparent px-1 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
      />
      <div className="mt-2 flex items-center gap-2">
        <button disabled={pending} className="rounded-full bg-[#2f56d8] px-3 py-1 text-xs font-semibold text-white disabled:opacity-60">
          {pending ? "Adding…" : "Add"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
          Cancel
        </button>
        <span className="ml-auto text-[11px]">
          <FormMessage state={state.error ? state : {}} />
        </span>
      </div>
    </form>
  );
}

/** Kanban board: drag cards between columns (or use "Move to" on phones). */
export function TaskBoard({ tasks: initial, today }: { tasks: BoardTask[]; today: string }) {
  const [tasks, setTasks] = useState(initial);
  const [source, setSource] = useState(initial);
  const [dragId, setDragId] = useState<number | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [, startTransition] = useTransition();

  // New data from the server (after a save elsewhere) replaces local order.
  if (initial !== source) {
    setSource(initial);
    setTasks(initial);
  }

  function move(id: number, status: string, beforeId: number | null) {
    const previous = tasks;
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    const rest = tasks.filter((item) => item.id !== id);
    const index = beforeId ? rest.findIndex((item) => item.id === beforeId) : -1;
    const moved = { ...task, status };
    setTasks(index === -1 ? [...rest, moved] : [...rest.slice(0, index), moved, ...rest.slice(index)]);
    setError("");
    setNotice("");
    startTransition(async () => {
      const result = await moveTaskAction(id, status, beforeId);
      if (result.error) {
        setTasks(previous);
        setError(result.error);
      } else if (result.notice) {
        setTasks((current) => current.map((item) => (item.id === id ? { ...item, status: "review" } : item)));
        setNotice(result.notice);
      }
    });
  }

  return (
    <>
      {error ? <p className="mb-3 rounded-xl bg-red-500/10 px-4 py-2 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
      {notice ? <p className="mb-3 rounded-xl bg-violet-500/10 px-4 py-2 text-sm text-violet-800 dark:text-violet-200">{notice}</p> : null}
      <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 xl:grid xl:grid-cols-4 xl:overflow-visible">
        {COLUMNS.map((column) => {
          const items = tasks.filter((task) => task.status === column.key);
          return (
            <section
              key={column.key}
              aria-label={column.label}
              onDragOver={(event) => {
                event.preventDefault();
                setOver(column.key);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) setOver(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setOver(null);
                const id = Number(event.dataTransfer.getData("text/plain")) || dragId;
                const card = (event.target as HTMLElement).closest("[data-task]");
                const beforeId = card ? Number(card.getAttribute("data-task")) : null;
                if (id && beforeId !== id) move(id, column.key, beforeId);
                setDragId(null);
              }}
              className={cn(
                "flex w-[17rem] shrink-0 snap-start flex-col rounded-2xl border border-transparent bg-foreground/[0.035] p-2.5 transition-colors xl:w-auto",
                over === column.key && "border-[#2f56d8]/40 bg-[#2f56d8]/[0.06]",
              )}
            >
              <header className="mb-2 flex items-center gap-2 px-1.5 pt-1">
                <span className={cn("size-2 rounded-full", column.tone)} aria-hidden />
                <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-foreground">{column.label}</h2>
                <span className="ml-auto rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground">{items.length}</span>
              </header>
              <div className="flex min-h-24 flex-1 flex-col gap-2">
                {items.map((task) => (
                  <div key={task.id} data-task={task.id}>
                    <TaskCard
                      task={task}
                      today={today}
                      dragging={dragId === task.id}
                      onDragStart={() => setDragId(task.id)}
                      onMove={(status) => move(task.id, status, null)}
                    />
                  </div>
                ))}
                {column.key !== "done" ? <QuickAdd status={column.key} /> : null}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
