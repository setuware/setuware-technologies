"use client";

import { useActionState } from "react";

import { deleteDocumentAction, uploadDocumentAction } from "@/app/admin/document-actions";
import { DOCUMENT_CATEGORIES, EMPLOYEE_DOCUMENT_CATEGORIES } from "@/lib/cms/document-types";

import { FormMessage, Label, SubmitButton } from "./form-bits";
import { buttonClass, Card, inputClass } from "./ui";
import type { FormState } from "@/app/admin/actions";

export function DocumentUploadForm({
  people,
  manages,
}: {
  people: { id: number; name: string }[];
  manages: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(uploadDocumentAction, {});
  const categories = manages ? DOCUMENT_CATEGORIES : EMPLOYEE_DOCUMENT_CATEGORIES;
  return (
    <form action={action}>
      <Card className="flex flex-col gap-4 p-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Upload a document</h2>
          <p className="mt-1 text-sm text-muted-foreground">{manages ? "Add a company document or a private document for a team member." : "Add your own ID proof, tax document or other file."}</p>
        </div>
        <FormMessage state={state} />
        <div className="grid gap-4 sm:grid-cols-2">
          {manages ? (
            <div>
              <Label htmlFor="document-user">For</Label>
              <select id="document-user" name="user_id" className={inputClass}>
                <option value="">Company-wide</option>
                {people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
              </select>
            </div>
          ) : null}
          <div>
            <Label htmlFor="document-category">Category</Label>
            <select id="document-category" name="category" required className={inputClass}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
          <div className={manages ? "sm:col-span-2" : ""}>
            <Label htmlFor="document-title">Title</Label>
            <input id="document-title" name="title" maxLength={200} required className={inputClass} placeholder="e.g. Travel policy" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="document-file">PDF or image <span className="text-xs font-normal text-muted-foreground">(max 10 MB; DOCX not supported)</span></Label>
            <input id="document-file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" required className={`${inputClass} file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium`} />
          </div>
        </div>
        <div><SubmitButton>Upload document</SubmitButton></div>
      </Card>
    </form>
  );
}

export function DeleteDocumentForm({ id }: { id: number }) {
  const [state, action] = useActionState<FormState, FormData>(deleteDocumentAction, {});
  return (
    <form action={action} className="flex flex-col items-start gap-2">
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={buttonClass.secondary}>Delete</button>
      <FormMessage state={state} />
    </form>
  );
}
