"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { inputClass } from "./ui";

const OTHER = "__other__";

export const DESIGNATIONS = [
  "Founder & CEO",
  "Project Manager",
  "Business Development Executive",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Mobile App Developer",
  "UI/UX Designer",
  "Graphic Designer",
  "QA Engineer",
  "DevOps Engineer",
  "SEO Specialist",
  "Digital Marketing Executive",
  "Content Writer",
  "HR Executive",
  "Accounts Executive",
  "Intern",
];

export const DEPARTMENTS = ["Management", "Engineering", "Design", "Marketing", "Sales", "Operations", "Human Resources", "Finance", "Support"];

/**
 * A dropdown of known values with an "Other" choice that opens a text box, so
 * a field stays a real dropdown without blocking a value that is not listed.
 */
export function ChoiceField({
  id,
  name,
  options,
  defaultValue = "",
  emptyLabel = "Not set",
  disabled = false,
  maxLength = 80,
  otherPlaceholder = "Type a new one",
}: {
  id: string;
  name: string;
  options: readonly string[];
  defaultValue?: string;
  emptyLabel?: string;
  disabled?: boolean;
  maxLength?: number;
  otherPlaceholder?: string;
}) {
  const known = [...new Set([...options, ...(defaultValue ? [defaultValue] : [])].map((option) => option.trim()).filter(Boolean))];
  const [choice, setChoice] = useState(defaultValue.trim());
  const [custom, setCustom] = useState("");
  // A save that changes the stored value arrives as a new default: show it.
  const saved = defaultValue.trim();
  const [seen, setSeen] = useState(saved);
  if (saved !== seen) {
    setSeen(saved);
    setChoice(saved);
    setCustom("");
  }
  const other = choice === OTHER;
  // React resets a form's DOM fields after its action runs. Keep the native
  // default on the chosen option so that reset lands on what is selected.
  const select = useRef<HTMLSelectElement>(null);
  useLayoutEffect(() => {
    for (const option of select.current?.options ?? []) option.defaultSelected = option.value === choice;
  });
  return (
    <div className="flex flex-col gap-2">
      <select
        ref={select}
        id={id}
        name={other ? undefined : name}
        value={choice}
        disabled={disabled}
        onChange={(event) => setChoice(event.target.value)}
        className={`${inputClass} disabled:opacity-60`}
      >
        <option value="">{emptyLabel}</option>
        {known.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
        <option value={OTHER}>Other…</option>
      </select>
      {other ? (
        <input
          name={name}
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          maxLength={maxLength}
          autoFocus
          aria-label={otherPlaceholder}
          placeholder={otherPlaceholder}
          className={inputClass}
        />
      ) : null}
    </div>
  );
}
