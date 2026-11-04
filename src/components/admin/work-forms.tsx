"use client";

import { useActionState } from "react";

import { saveProfileAction, saveProjectAction } from "@/app/admin/work-actions";
import type { FormState } from "@/app/admin/actions";

import { FormMessage, SubmitButton } from "./form-bits";
import { inputClass } from "./ui";

const LABEL = "mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground";

export function ProfileForm({
  person,
  managers,
  departments,
  manage,
}: {
  person: { id: number; designation: string; department: string; phone: string; joinedOn: string | null; birthday: string | null; managerId: number | null };
  managers: { id: number; name: string }[];
  departments: string[];
  manage: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(saveProfileAction, {});
  const locked = !manage;
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="user_id" value={person.id} />
      <div>
        <label htmlFor="designation" className={LABEL}>
          Designation
        </label>
        <input id="designation" name="designation" defaultValue={person.designation} disabled={locked} placeholder="e.g. Frontend Developer" className={`${inputClass} disabled:opacity-60`} />
      </div>
      <div>
        <label htmlFor="department" className={LABEL}>
          Department
        </label>
        <input id="department" name="department" list="departments" defaultValue={person.department} disabled={locked} placeholder="e.g. Engineering" className={`${inputClass} disabled:opacity-60`} />
        <datalist id="departments">
          {departments.map((department) => (
            <option key={department} value={department} />
          ))}
        </datalist>
      </div>
      <div>
        <label htmlFor="manager_id" className={LABEL}>
          Reports to
        </label>
        <select id="manager_id" name="manager_id" defaultValue={person.managerId ?? ""} disabled={locked} className={`${inputClass} disabled:opacity-60`}>
          <option value="">Nobody</option>
          {managers
            .filter((manager) => manager.id !== person.id)
            .map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name}
              </option>
            ))}
        </select>
        {manage ? <p className="mt-1 text-[11px] text-muted-foreground">Their manager approves their leave and timesheets.</p> : null}
      </div>
      <div>
        <label htmlFor="joined_on" className={LABEL}>
          Joined on
        </label>
        <input id="joined_on" name="joined_on" type="date" defaultValue={person.joinedOn ?? ""} disabled={locked} className={`${inputClass} disabled:opacity-60`} />
      </div>
      <div>
        <label htmlFor="phone" className={LABEL}>
          Phone
        </label>
        <input id="phone" name="phone" type="tel" defaultValue={person.phone} placeholder="+91 98765 43210" className={inputClass} />
      </div>
      <div>
        <label htmlFor="birthday" className={LABEL}>
          Birthday
        </label>
        <input id="birthday" name="birthday" type="date" defaultValue={person.birthday ?? ""} className={inputClass} />
        <p className="mt-1 text-[11px] text-muted-foreground">Only the day and month are shown to the team.</p>
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <SubmitButton>Save profile</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}

const STATUSES = [
  ["active", "Active"],
  ["on_hold", "On hold"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
] as const;

export function ProjectForm({
  project,
  team,
}: {
  project?: { name: string; client: string; status: string; owner_id: number | null; start_date: string | null; deadline: string | null; budget_hours: number | null; description: string };
  team: { id: number; name: string }[];
}) {
  const [state, action] = useActionState<FormState, FormData>(saveProjectAction, {});
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      {project ? <input type="hidden" name="previous_name" value={project.name} /> : null}
      <div>
        <label htmlFor="p_name" className={LABEL}>
          Project name
        </label>
        <input id="p_name" name="name" required maxLength={80} defaultValue={project?.name} placeholder="e.g. Acme website" className={inputClass} />
      </div>
      <div>
        <label htmlFor="p_client" className={LABEL}>
          Client
        </label>
        <input id="p_client" name="client" maxLength={120} defaultValue={project?.client} placeholder="e.g. Acme Pvt Ltd" className={inputClass} />
      </div>
      <div>
        <label htmlFor="p_status" className={LABEL}>
          Status
        </label>
        <select id="p_status" name="status" defaultValue={project?.status ?? "active"} className={inputClass}>
          {STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="p_owner" className={LABEL}>
          Project manager
        </label>
        <select id="p_owner" name="owner_id" defaultValue={project?.owner_id ?? ""} className={inputClass}>
          <option value="">Not set</option>
          {team.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="p_start" className={LABEL}>
          Start
        </label>
        <input id="p_start" name="start_date" type="date" defaultValue={project?.start_date ?? ""} className={inputClass} />
      </div>
      <div>
        <label htmlFor="p_deadline" className={LABEL}>
          Deadline
        </label>
        <input id="p_deadline" name="deadline" type="date" defaultValue={project?.deadline ?? ""} className={inputClass} />
      </div>
      <div>
        <label htmlFor="p_budget" className={LABEL}>
          Budget (hours)
        </label>
        <input id="p_budget" name="budget_hours" type="number" min="0" step="1" defaultValue={project?.budget_hours ?? ""} placeholder="e.g. 120" className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="p_description" className={LABEL}>
          Scope / notes
        </label>
        <textarea id="p_description" name="description" rows={4} defaultValue={project?.description} placeholder="What's included, links, contacts…" className={inputClass} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <SubmitButton>{project ? "Save project" : "Create project"}</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
