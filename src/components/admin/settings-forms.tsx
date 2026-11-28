"use client";

import { useActionState, useState } from "react";

import { saveAnnouncementAction, saveSecuritySettingsAction, saveTemplateAction, type FormState } from "@/app/admin/actions";

import { FormMessage, SubmitButton } from "./form-bits";
import { inputClass } from "./ui";

export function TemplateForm({
  template,
}: {
  template?: { id: number; name: string; audience: "enquiry" | "application"; subject: string; body: string };
}) {
  const [state, action] = useActionState<FormState, FormData>(saveTemplateAction, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      {template ? <input type="hidden" name="id" value={template.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <input name="name" defaultValue={template?.name} placeholder="Template name" aria-label="Template name" className={inputClass} />
        <select name="audience" defaultValue={template?.audience ?? "enquiry"} aria-label="Used for" className={inputClass}>
          <option value="enquiry">For enquiries</option>
          <option value="application">For applicants</option>
        </select>
      </div>
      <input name="subject" defaultValue={template?.subject} placeholder="Subject" aria-label="Subject" className={inputClass} />
      <textarea name="body" rows={8} defaultValue={template?.body} placeholder="Message" aria-label="Message" className={inputClass} />
      <p className="text-xs text-muted-foreground">
        Placeholders: <code>{"{{first_name}}"}</code>, <code>{"{{name}}"}</code>, <code>{"{{service}}"}</code>, <code>{"{{job}}"}</code>,{" "}
        <code>{"{{sender}}"}</code>
      </p>
      <FormMessage state={state} />
      <SubmitButton className="self-start">{template ? "Save template" : "Add template"}</SubmitButton>
    </form>
  );
}

export function AnnouncementForm({ initial }: { initial: { enabled: boolean; text: string; link: string; linkLabel: string } }) {
  const [state, action] = useActionState<FormState, FormData>(saveAnnouncementAction, {});
  const [text, setText] = useState(initial.text);
  const [linkLabel, setLinkLabel] = useState(initial.linkLabel);
  const [enabled, setEnabled] = useState(initial.enabled);
  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border">
        <div className={`bg-[linear-gradient(100deg,#1d3fae,#1468ad_55%,#0a8ea6)] px-4 py-2 text-center text-[0.8rem] font-medium text-white ${enabled ? "" : "opacity-40"}`}>
          {text || "Your announcement appears here"} {linkLabel ? <span className="ml-1 font-semibold underline underline-offset-4">{linkLabel} →</span> : null}
        </div>
        <div className="bg-[#0b1020] px-4 py-3 text-xs text-white/50">Navbar · preview</div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <input type="checkbox" name="enabled" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="size-4 accent-[#2f56d8]" />
        Show the announcement bar on the website
      </label>
      <input
        name="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        maxLength={160}
        placeholder="e.g. Diwali offer: 15% off website projects booked this month"
        aria-label="Announcement text"
        className={inputClass}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="link" defaultValue={initial.link} placeholder="Link, e.g. /book or https://…" aria-label="Link" className={inputClass} />
        <input
          name="linkLabel"
          value={linkLabel}
          onChange={(event) => setLinkLabel(event.target.value)}
          maxLength={40}
          placeholder="Link text, e.g. Book a call"
          aria-label="Link text"
          className={inputClass}
        />
      </div>
      <FormMessage state={state} />
      <SubmitButton className="self-start">Save</SubmitButton>
    </form>
  );
}

export function SecuritySettingsForm({ required }: { required: boolean }) {
  const [state, action] = useActionState<FormState, FormData>(saveSecuritySettingsAction, {});
  const [enabled, setEnabled] = useState(required);
  return (
    <form action={action} className="flex flex-col items-start gap-4">
      <label className="flex items-start gap-2 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          name="require2faAdmins"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
          className="mt-0.5 size-4 accent-[#2f56d8]"
        />
        <span>Require two-step sign-in for administrators</span>
      </label>
      <p className="text-xs text-muted-foreground">
        People with access to Team, Roles &amp; access, or Site settings must turn on two-step verification before opening those sections.
      </p>
      <FormMessage state={state} />
      <SubmitButton className="self-start">Save security settings</SubmitButton>
    </form>
  );
}
