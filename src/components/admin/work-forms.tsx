"use client";

import { useActionState } from "react";

import { postUpdateAction, saveProfileAction, saveProjectAction } from "@/app/admin/work-actions";
import type { FormState } from "@/app/admin/actions";

import { ChoiceField, DEPARTMENTS, DESIGNATIONS } from "./choice-field";
import { FormMessage, SubmitButton } from "./form-bits";
import { inputClass } from "./ui";

const LABEL = "mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground";

export function ProfileForm({
  person,
  managers,
  departments,
  manage,
}: {
  person: {
    id: number;
    designation: string;
    department: string;
    phone: string;
    joinedOn: string | null;
    birthday: string | null;
    managerId: number | null;
    bio: string;
    skills: string[];
    location: string;
    emergencyContact: string;
    employeeCode: string;
    employmentType: string;
  };
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
        <ChoiceField id="designation" name="designation" options={DESIGNATIONS} defaultValue={person.designation} disabled={locked} />
      </div>
      <div>
        <label htmlFor="department" className={LABEL}>
          Department
        </label>
        <ChoiceField id="department" name="department" options={[...DEPARTMENTS, ...departments]} defaultValue={person.department} disabled={locked} emptyLabel="Not set" />
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
      <div>
        <label htmlFor="employee_code" className={LABEL}>
          Employee ID
        </label>
        <input id="employee_code" name="employee_code" defaultValue={person.employeeCode} disabled={locked} placeholder="e.g. SW-014" className={`${inputClass} disabled:opacity-60`} />
      </div>
      <div>
        <label htmlFor="employment_type" className={LABEL}>
          Employment type
        </label>
        <select id="employment_type" name="employment_type" defaultValue={person.employmentType} disabled={locked} className={`${inputClass} disabled:opacity-60`}>
          <option value="">Not set</option>
          {["Full-time", "Part-time", "Intern", "Contract", "Freelance"].map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="location" className={LABEL}>
          Works from
        </label>
        <input id="location" name="location" defaultValue={person.location} placeholder="e.g. Gurugram office, or Remote (Patna)" className={inputClass} />
      </div>
      <div>
        <label htmlFor="emergency_contact" className={LABEL}>
          Emergency contact
        </label>
        <input id="emergency_contact" name="emergency_contact" defaultValue={person.emergencyContact} placeholder="Name and phone number" className={inputClass} />
        <p className="mt-1 text-[11px] text-muted-foreground">Only you and team admins can see this.</p>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="skills" className={LABEL}>
          Skills
        </label>
        <input id="skills" name="skills" defaultValue={person.skills.join(", ")} placeholder="React, Next.js, Figma — separate with commas" className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="bio" className={LABEL}>
          About
        </label>
        <textarea id="bio" name="bio" rows={3} maxLength={600} defaultValue={person.bio} placeholder="A few lines on what you do and what you like working on." className={`${inputClass} h-auto py-2.5`} />
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

/** Composer for a short work update. */
export function UpdateComposer({ placeholder = "What did you work on today?" }: { placeholder?: string }) {
  const [state, action] = useActionState<FormState, FormData>(postUpdateAction, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="update-body" className="sr-only">
        Work update
      </label>
      <textarea id="update-body" name="body" rows={3} maxLength={1000} required placeholder={placeholder} className={`${inputClass} h-auto py-2.5`} />
      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel="Posting…">Post update</SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
