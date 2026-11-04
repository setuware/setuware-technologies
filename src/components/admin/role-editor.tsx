"use client";

import { useActionState, useState } from "react";

import { saveRoleAction, type FormState } from "@/app/admin/actions";
import type { PermissionGroup } from "@/lib/cms/rbac";
import { cn } from "@/lib/utils";

import { FormMessage, SubmitButton } from "./form-bits";
import { inputClass } from "./ui";

/** Name, description and a permission grid: one row per section. */
export function RoleEditor({
  groups,
  role,
}: {
  groups: PermissionGroup[];
  role?: { key: string; name: string; description: string; permissions: string[] };
}) {
  const [state, action] = useActionState<FormState, FormData>(saveRoleAction, {});
  const [selected, setSelected] = useState<Set<string>>(new Set(role?.permissions ?? []));

  const toggle = (key: string, on: boolean) => {
    const next = new Set(selected);
    if (on) {
      next.add(key);
      // Any action needs the section to be visible.
      const area = key.split(".")[0];
      if (!key.endsWith(".view") && groups.find((group) => group.module === area)?.actions.some((a) => a.key === "view")) next.add(`${area}.view`);
    } else {
      next.delete(key);
      if (key.endsWith(".view")) for (const item of [...next]) if (item.startsWith(key.replace(".view", "."))) next.delete(item);
    }
    setSelected(next);
  };

  const toggleRow = (group: PermissionGroup, on: boolean) => {
    const next = new Set(selected);
    for (const action of group.actions) (on ? next.add.bind(next) : next.delete.bind(next))(`${group.module}.${action.key}`);
    if (group.scoped) (on ? next.add.bind(next) : next.delete.bind(next))(`${group.module}.all`);
    setSelected(next);
  };

  return (
    <form action={action} className="flex flex-col gap-5">
      {role ? <input type="hidden" name="key" value={role.key} /> : null}
      {[...selected].map((permission) => (
        <input key={permission} type="hidden" name="permissions" value={permission} />
      ))}
      <div className="grid gap-3 sm:grid-cols-[16rem_1fr]">
        <input name="name" defaultValue={role?.name} placeholder="Role name, e.g. Sales Executive" aria-label="Role name" className={inputClass} />
        <input name="description" defaultValue={role?.description} placeholder="What this role is for" aria-label="Description" className={inputClass} />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-foreground/[0.025] text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Section</th>
              <th className="px-4 py-2.5">Allowed actions</th>
              <th className="px-4 py-2.5">Records</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {groups.map((group) => {
              const keys = [...group.actions.map((a) => `${group.module}.${a.key}`), ...(group.scoped ? [`${group.module}.all`] : [])];
              const allOn = keys.every((key) => selected.has(key));
              return (
                <tr key={group.module}>
                  <td className="px-4 py-3 align-top">
                    <label className="flex items-center gap-2 font-semibold text-foreground">
                      <input type="checkbox" checked={allOn} onChange={(event) => toggleRow(group, event.target.checked)} className="size-4 accent-[#2f56d8]" />
                      {group.label}
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {group.actions.map((a) => {
                        const key = `${group.module}.${a.key}`;
                        const on = selected.has(key);
                        return (
                          <label
                            key={key}
                            className={cn(
                              "cursor-pointer select-none rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                              on ? "border-[#2f56d8] bg-[#2f56d8]/10 text-[#2f56d8] dark:text-[#8fb0ff]" : "border-border text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <input type="checkbox" checked={on} onChange={(event) => toggle(key, event.target.checked)} className="sr-only" />
                            {a.label}
                          </label>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {group.scoped ? (
                      <select
                        aria-label={`${group.label} records`}
                        value={selected.has(`${group.module}.all`) ? "all" : "own"}
                        onChange={(event) => toggle(`${group.module}.all`, event.target.value === "all")}
                        className={`${inputClass} w-auto py-1 text-xs`}
                      >
                        <option value="own">Only assigned to them</option>
                        <option value="all">All records</option>
                      </select>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <FormMessage state={state} />
      <SubmitButton className="self-start">{role ? "Save role" : "Create role"}</SubmitButton>
    </form>
  );
}
