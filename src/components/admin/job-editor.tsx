"use client";

import { useActionState, useState } from "react";

import { saveJobAction, type FormState } from "@/app/admin/actions";
import { slugify } from "@/lib/cms/markdown";
import { cn } from "@/lib/utils";

import { ChoiceField } from "./choice-field";
import { FieldError, FormMessage, Label, SubmitButton } from "./form-bits";
import { Card, inputClass } from "./ui";

export interface JobDraft {
  id?: number;
  slug: string;
  title: string;
  short_title: string;
  team: string;
  location: string;
  type: string;
  experience: string;
  summary: string;
  skills: string;
  responsibilities: string;
  requirements: string;
  nice_to_haves: string;
  status: "draft" | "open" | "closed";
  posted_at: string;
}

export function JobEditor({
  initial,
  teams,
  types,
  locations,
}: {
  initial: JobDraft;
  teams: readonly string[];
  types: readonly string[];
  locations: readonly string[];
}) {
  const [state, action] = useActionState<FormState, FormData>(saveJobAction, {});
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.id));
  const [summary, setSummary] = useState(initial.summary);
  const f = state.fields ?? {};

  const listField = (name: keyof JobDraft, label: string, hint: string, rows = 6) => (
    <div>
      <Label htmlFor={name} hint={hint}>
        {label}
      </Label>
      <textarea id={name} name={name} rows={rows} defaultValue={String(initial[name] ?? "")} className={inputClass} />
      <FieldError message={f[name]} />
    </div>
  );

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div className="flex min-w-0 flex-col gap-5">
        <FormMessage state={state} />
        <Card className="flex flex-col gap-4 p-5">
          <div>
            <Label htmlFor="title">Job title</Label>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (!slugEdited) setSlug(slugify(event.target.value));
              }}
              placeholder="Senior Full-Stack Developer"
              className={cn(inputClass, "text-base font-semibold")}
            />
            <FieldError message={f.title} />
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="shrink-0 text-muted-foreground">setuware.in/careers/</span>
              <input
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  setSlug(slugify(event.target.value));
                }}
                aria-label="URL slug"
                className={cn(inputClass, "py-1.5")}
              />
            </div>
            <FieldError message={f.slug} />
          </div>
          <div>
            <Label htmlFor="summary" hint="also the Google description" counter={{ value: summary.length, max: 155 }}>
              Summary
            </Label>
            <textarea
              id="summary"
              name="summary"
              rows={3}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              className={inputClass}
            />
            <FieldError message={f.summary} />
          </div>
          <div>
            <Label htmlFor="skills" hint="comma-separated">
              Skills
            </Label>
            <input id="skills" name="skills" defaultValue={initial.skills} placeholder="Next.js, TypeScript, PostgreSQL" className={inputClass} />
          </div>
        </Card>

        <Card className="flex flex-col gap-4 p-5">
          {listField("responsibilities", "Responsibilities", "one per line")}
          {listField("requirements", "Requirements", "one per line")}
          {listField("nice_to_haves", "Nice to have", "one per line, optional", 4)}
        </Card>
      </div>

      <div className="flex flex-col gap-5 xl:sticky xl:top-6 xl:self-start">
        <Card className="flex flex-col gap-3 p-5">
          <h3 className="text-sm font-semibold text-foreground">Status</h3>
          <select name="status" defaultValue={initial.status} className={inputClass} aria-label="Status">
            <option value="open">Open: listed on the careers page</option>
            <option value="draft">Draft: hidden</option>
            <option value="closed">Closed: hidden, applications stop</option>
          </select>
          <div>
            <Label htmlFor="posted_at">Posted on</Label>
            <input id="posted_at" name="posted_at" type="date" defaultValue={initial.posted_at.slice(0, 10)} className={inputClass} />
            <p className="mt-1 text-xs text-muted-foreground">Google lists it for 60 days from this date.</p>
          </div>
          <SubmitButton pendingLabel="Saving…" className="mt-2">
            Save job
          </SubmitButton>
          {initial.id && initial.status === "open" ? (
            <a href={`/careers/${initial.slug}`} target="_blank" rel="noreferrer" className="text-center text-sm font-medium text-setu-dark hover:underline dark:text-[#5fd0ec]">
              View on site ↗
            </a>
          ) : null}
        </Card>

        <Card className="flex flex-col gap-3 p-5">
          <h3 className="text-sm font-semibold text-foreground">Details</h3>
          <div>
            <Label htmlFor="team">Team</Label>
            <ChoiceField id="team" name="team" options={teams} defaultValue={initial.team} emptyLabel="Choose a team" />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <select id="type" name="type" defaultValue={initial.type} className={inputClass}>
              {types.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <ChoiceField id="location" name="location" options={locations} defaultValue={initial.location} emptyLabel="Choose a location" />
          </div>
          <div>
            <Label htmlFor="experience">Experience</Label>
            <input id="experience" name="experience" defaultValue={initial.experience} placeholder="2–4 years" className={inputClass} />
          </div>
          <div>
            <Label htmlFor="short_title" hint="optional">
              Short title for the browser tab
            </Label>
            <input id="short_title" name="short_title" defaultValue={initial.short_title} className={inputClass} />
          </div>
        </Card>
      </div>
    </form>
  );
}
