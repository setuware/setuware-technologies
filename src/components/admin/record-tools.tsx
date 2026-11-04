"use client";

import { useActionState, useState } from "react";
import { Mail, Send, Star } from "lucide-react";

import { addNoteAction, sendEmailAction, updateRecordAction, type FormState } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

import { FormMessage, SubmitButton } from "./form-bits";
import { inputClass } from "./ui";

type Entity = "enquiry" | "application";

/** Status, owner, and follow-up (enquiries) or rating and interview (applications). */
export function RecordPanel({
  entity,
  id,
  status,
  statuses,
  assignee,
  team,
  followUp,
  rating,
  interview,
}: {
  entity: Entity;
  id: number;
  status: string;
  statuses: readonly string[];
  assignee: string | null;
  team: string[];
  followUp?: string | null;
  rating?: number | null;
  interview?: string | null;
}) {
  const [state, action] = useActionState<FormState, FormData>(updateRecordAction, {});
  const [stars, setStars] = useState(rating ?? 0);
  return (
    <form action={action} className="flex flex-col gap-3.5">
      <input type="hidden" name="entity" value={entity} />
      <input type="hidden" name="id" value={id} />
      <div>
        <label htmlFor="status" className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Status
        </label>
        <select id="status" name="status" defaultValue={status} className={`${inputClass} capitalize`}>
          {statuses.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="assignee" className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          Owner
        </label>
        <select id="assignee" name="assignee" defaultValue={assignee ?? ""} className={inputClass}>
          <option value="">Unassigned</option>
          {team.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      {entity === "enquiry" ? (
        <div>
          <label htmlFor="follow_up_at" className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Follow up on
          </label>
          <input id="follow_up_at" name="follow_up_at" type="date" defaultValue={followUp ?? ""} className={inputClass} />
        </div>
      ) : (
        <>
          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Rating</span>
            <input type="hidden" name="rating" value={stars || ""} />
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={stars === value}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  onClick={() => setStars(stars === value ? 0 : value)}
                  className="rounded p-0.5"
                >
                  <Star className={cn("size-6 transition-colors", value <= stars ? "fill-amber-400 text-amber-400" : "text-foreground/20 hover:text-amber-300")} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="interview_at" className="mb-1 block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Interview
            </label>
            <input id="interview_at" name="interview_at" type="datetime-local" defaultValue={interview ?? ""} className={inputClass} />
          </div>
        </>
      )}
      <FormMessage state={state} />
      <SubmitButton>Save changes</SubmitButton>
    </form>
  );
}

export interface TemplateOption {
  id: number;
  name: string;
  subject: string;
  body: string;
}

/** Write or pick a template; placeholders are filled before sending. */
export function EmailComposer({
  entity,
  id,
  to,
  templates,
  values,
}: {
  entity: Entity;
  id: number;
  to: string;
  templates: TemplateOption[];
  values: Record<string, string>;
}) {
  const [state, action] = useActionState<FormState, FormData>(sendEmailAction, {});
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const fill = (value: string) => value.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) => values[key] ?? match);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[linear-gradient(100deg,#2f56d8,#1477c0_55%,#0a8ea6)] px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
      >
        <Mail className="size-4" aria-hidden /> Write email
      </button>
    );
  }

  return (
    <form action={action} className="flex w-full flex-col gap-3 rounded-2xl border border-border bg-background/60 p-4">
      <input type="hidden" name="entity" value={entity} />
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          To <span className="font-semibold text-foreground">{to}</span>
        </p>
        {templates.length ? (
          <select
            aria-label="Use a template"
            defaultValue=""
            onChange={(event) => {
              const template = templates.find((item) => String(item.id) === event.target.value);
              if (template) {
                setSubject(fill(template.subject));
                setBody(fill(template.body));
              }
            }}
            className={`${inputClass} w-auto py-1.5 text-xs`}
          >
            <option value="">Use a template…</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      <input name="subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" aria-label="Subject" className={inputClass} />
      <textarea
        name="body"
        rows={9}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Write your message…"
        aria-label="Message"
        className={inputClass}
      />
      <FormMessage state={state} />
      <div className="flex items-center gap-2">
        <SubmitButton pendingLabel="Sending…">
          <Send className="size-4" aria-hidden /> Send email
        </SubmitButton>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground">
          Cancel
        </button>
        <span className="ml-auto text-xs text-muted-foreground">Sent from your name; replies come to you.</span>
      </div>
    </form>
  );
}

export function AddNoteForm({ entity, id }: { entity: Entity; id: number }) {
  const [state, action] = useActionState<FormState, FormData>(addNoteAction, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="entity" value={entity} />
      <input type="hidden" name="id" value={id} />
      <textarea name="body" rows={3} placeholder="Add a note for the team…" aria-label="Note" className={inputClass} />
      <div className="flex items-center gap-3">
        <SubmitButton variant="secondary" pendingLabel="Adding…">
          Add note
        </SubmitButton>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
