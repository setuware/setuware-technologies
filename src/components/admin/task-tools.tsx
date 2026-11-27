"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";

import { createTaskAction, logTimeAction, reviewTaskAction, taskCommentAction, updateTaskAction } from "@/app/admin/work-actions";
import type { FormState } from "@/app/admin/actions";

import { ChoiceField } from "./choice-field";
import { FormMessage, SubmitButton } from "./form-bits";
import { buttonClass, inputClass } from "./ui";

export interface Member {
  id: number;
  name: string;
}

const LABEL = "mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground";
const PRIORITIES = [
  ["urgent", "Urgent"],
  ["high", "High"],
  ["normal", "Normal"],
  ["low", "Low"],
] as const;
const STATUSES = [
  ["todo", "To do"],
  ["in_progress", "In progress"],
  ["review", "In review"],
  ["done", "Done"],
] as const;

function AssigneeSelect({ team, value, canAssign, me }: { team: Member[]; value: number | null; canAssign: boolean; me: Member }) {
  const options = canAssign ? team : team.filter((member) => member.id === me.id || member.id === value);
  return (
    <select id="assignee_id" name="assignee_id" defaultValue={value ?? ""} className={inputClass}>
      <option value="">Unassigned</option>
      {options.map((member) => (
        <option key={member.id} value={member.id}>
          {member.id === me.id ? `${member.name} (me)` : member.name}
        </option>
      ))}
    </select>
  );
}

function ReviewerSelect({ reviewers, value, canAssign }: { reviewers: Member[]; value: number | null; canAssign: boolean }) {
  return (
    <>
      <select id="reviewer_id" name="reviewer_id" defaultValue={value ?? ""} disabled={!canAssign} className={`${inputClass} disabled:opacity-60`}>
        <option value="">No review needed</option>
        {reviewers.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
      {!canAssign ? <p className="mt-1 text-[11px] text-muted-foreground">Set by whoever assigns the task.</p> : null}
    </>
  );
}

/** Full "New task" form. */
export function NewTaskForm({
  team,
  me,
  canAssign,
  projects,
  link,
  reviewers,
}: {
  reviewers: Member[];
  team: Member[];
  me: Member;
  canAssign: boolean;
  projects: string[];
  link?: { entity: string; id: number; label: string } | null;
}) {
  const [state, action] = useActionState<FormState, FormData>(createTaskAction, {});
  return (
    <form action={action} className="grid gap-5">
      {link ? (
        <>
          <input type="hidden" name="entity" value={link.entity} />
          <input type="hidden" name="entity_id" value={link.id} />
          <p className="rounded-xl bg-[#2f56d8]/8 px-4 py-2.5 text-sm text-foreground">
            Linked to <strong>{link.label}</strong>
          </p>
        </>
      ) : null}
      <div>
        <label htmlFor="title" className={LABEL}>
          Task
        </label>
        <input id="title" name="title" required autoFocus maxLength={200} placeholder="e.g. Send the revised proposal to Acme" className={inputClass} />
      </div>
      <div>
        <label htmlFor="description" className={LABEL}>
          Details
        </label>
        <textarea id="description" name="description" rows={5} placeholder="What does done look like? Links, files, context…" className={inputClass} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="assignee_id" className={LABEL}>
            Assign to
          </label>
          <AssigneeSelect team={team} value={me.id} canAssign={canAssign} me={me} />
        </div>
        <div>
          <label htmlFor="reviewer_id" className={LABEL}>
            Reviewer
          </label>
          <ReviewerSelect reviewers={reviewers} value={null} canAssign={canAssign} />
        </div>
        <div>
          <label htmlFor="due_date" className={LABEL}>
            Due date
          </label>
          <input id="due_date" name="due_date" type="date" className={inputClass} />
        </div>
        <div>
          <label htmlFor="priority" className={LABEL}>
            Priority
          </label>
          <select id="priority" name="priority" defaultValue="normal" className={inputClass}>
            {PRIORITIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="project" className={LABEL}>
            Project / client
          </label>
          <ChoiceField id="project" name="project" options={projects} emptyLabel="No project" />
        </div>
        <div>
          <label htmlFor="estimate_hours" className={LABEL}>
            Estimate (hours)
          </label>
          <input id="estimate_hours" name="estimate_hours" type="number" min="0" step="0.25" placeholder="e.g. 2.5" className={inputClass} />
        </div>
        <div>
          <label htmlFor="repeat" className={LABEL}>
            Repeat
          </label>
          <select id="repeat" name="repeat" defaultValue="" className={inputClass}>
            <option value="">Doesn’t repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label htmlFor="status" className={LABEL}>
            Column
          </label>
          <select id="status" name="status" defaultValue="todo" className={inputClass}>
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Creating…">Create task</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/** Status, priority, owner, due date, project and estimate on the task page. */
export function TaskPanel({
  task,
  team,
  me,
  canAssign,
  projects,
  reviewers,
  version,
}: {
  /** Changes when the task changes on the server, so the fields show the saved values. */
  version: string;
  reviewers: Member[];
  task: { id: number; status: string; priority: string; assignee_id: number | null; reviewer_id: number | null; due_date: string | null; project: string; estimate_minutes: number | null; repeat?: string | null };
  team: Member[];
  me: Member;
  canAssign: boolean;
  projects: string[];
}) {
  const [state, action] = useActionState<FormState, FormData>(updateTaskAction, {});
  return (
    <form action={action} className="flex flex-col gap-3.5">
      <input type="hidden" name="id" value={task.id} />
      <div key={version} className="flex flex-col gap-3.5">
      <div>
        <label htmlFor="status" className={LABEL}>
          Status
        </label>
        <select id="status" name="status" defaultValue={task.status} className={inputClass}>
          {STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="assignee_id" className={LABEL}>
          Assigned to
        </label>
        <AssigneeSelect team={team} value={task.assignee_id} canAssign={canAssign} me={me} />
      </div>
      <div>
        <label htmlFor="reviewer_id" className={LABEL}>
          Reviewer
        </label>
        <ReviewerSelect reviewers={reviewers} value={task.reviewer_id} canAssign={canAssign} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="priority" className={LABEL}>
            Priority
          </label>
          <select id="priority" name="priority" defaultValue={task.priority} className={inputClass}>
            {PRIORITIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="due_date" className={LABEL}>
            Due
          </label>
          <input id="due_date" name="due_date" type="date" defaultValue={task.due_date ?? ""} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="project" className={LABEL}>
            Project
          </label>
          <ChoiceField id="project" name="project" options={projects} defaultValue={task.project} emptyLabel="No project" />
        </div>
        <div>
          <label htmlFor="estimate_hours" className={LABEL}>
            Estimate (h)
          </label>
          <input
            id="estimate_hours"
            name="estimate_hours"
            type="number"
            min="0"
            step="0.25"
            defaultValue={task.estimate_minutes ? task.estimate_minutes / 60 : ""}
            className={inputClass}
          />
        </div>
        <div className="col-span-full">
          <label htmlFor="repeat" className={LABEL}>
            Repeat
          </label>
          <select id="repeat" name="repeat" defaultValue={task.repeat ?? ""} className={inputClass}>
            <option value="">Doesn’t repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <SubmitButton>Save</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/** Title and description, editable in place. */
export function TaskText({ id, title, description, editable }: { id: number; title: string; description: string; editable: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(async (previous: FormState, form: FormData) => {
    const result = await updateTaskAction(previous, form);
    if (!result.error) setEditing(false);
    return result;
  }, {});
  if (!editing) {
    return (
      <div>
        <div className="flex items-start gap-3">
          <h2 className="flex-1 font-display text-xl font-semibold leading-snug text-foreground">{title}</h2>
          {editable ? (
            <button type="button" onClick={() => setEditing(true)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground" aria-label="Edit task">
              <Pencil className="size-4" />
            </button>
          ) : null}
        </div>
        {description ? (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{description}</p>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No details yet.</p>
        )}
      </div>
    );
  }
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <input name="title" defaultValue={title} required maxLength={200} aria-label="Title" className={`${inputClass} text-base font-semibold`} />
      <textarea name="description" defaultValue={description} rows={6} aria-label="Details" className={inputClass} />
      <div className="flex items-center gap-2">
        <SubmitButton>Save</SubmitButton>
        <button type="button" onClick={() => setEditing(false)} className={buttonClass.secondary}>
          Cancel
        </button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function TaskCommentForm({ id }: { id: number }) {
  const [state, action] = useActionState<FormState, FormData>(taskCommentAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <textarea name="body" rows={3} placeholder="Add an update or ask a question…" aria-label="Comment" className={inputClass} />
      <div className="flex items-center gap-3">
        <SubmitButton variant="secondary" pendingLabel="Posting…">
          Comment
        </SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

export function LogTimeForm({ taskId, today }: { taskId: number; today: string }) {
  const [state, action] = useActionState<FormState, FormData>(logTimeAction, {});
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="task_id" value={taskId} />
      <div className="grid grid-cols-2 gap-2">
        <input name="duration" required placeholder="1:30 or 1.5" aria-label="Time spent" className={inputClass} />
        <input name="day" type="date" defaultValue={today} max={today} aria-label="Day" className={inputClass} />
      </div>
      <input name="note" placeholder="What did you do? (optional)" aria-label="Note" className={inputClass} />
      <div className="flex items-center gap-3">
        <SubmitButton variant="secondary" pendingLabel="Logging…">
          Log time
        </SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

/** Reviewer's box on a task waiting for review. */
export function ReviewBox({ id, assignee }: { id: number; assignee: string | null }) {
  const [state, action] = useActionState<FormState, FormData>(reviewTaskAction, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-foreground">
        {assignee ?? "The assignee"} finished this task. Check the work, then approve it or send it back with what to change.
      </p>
      <textarea name="comment" rows={3} placeholder="Feedback (required when asking for changes)" aria-label="Review comment" className={inputClass} />
      <div className="flex flex-wrap items-center gap-2">
        <SubmitButton name="decision" value="approve" pendingLabel="Saving…" className="bg-none bg-emerald-600">
          Approve & mark done
        </SubmitButton>
        <SubmitButton name="decision" value="changes" variant="secondary" pendingLabel="Sending…">
          Request changes
        </SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
