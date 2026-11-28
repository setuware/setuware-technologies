"use server";

import { refresh } from "next/cache";

import { audit, can, listUsers } from "@/lib/cms/auth";
import { createDocument, deleteDocument, DOCUMENT_CATEGORIES, EMPLOYEE_DOCUMENT_CATEGORIES, getDocument, canDeleteDocument } from "@/lib/cms/documents";
import { COMPANY_DOCUMENT_CATEGORIES } from "@/lib/cms/document-types";
import { notify } from "@/lib/cms/notify";
import { deleteUpload, saveUpload, UploadError } from "@/lib/cms/uploads";
import { requireUser } from "@/lib/cms/session";

import type { FormState } from "./actions";

const text = (form: FormData, key: string, max = 200) => String(form.get(key) ?? "").trim().slice(0, max);

export async function uploadDocumentAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const manages = can(user, "documents.manage");
  const title = text(form, "title");
  const category = text(form, "category", 40);
  const fileValue = form.get("file");
  const file = typeof File !== "undefined" && fileValue instanceof File && fileValue.size > 0 ? fileValue : null;
  const rawUserId = text(form, "user_id", 20);
  const targetId = manages ? (rawUserId ? Number(rawUserId) : null) : user.id;

  if (title.length < 2) return { error: "Add a document title." };
  if (!(DOCUMENT_CATEGORIES as readonly string[]).includes(category)) return { error: "Choose a document category." };
  if (!manages && !(EMPLOYEE_DOCUMENT_CATEGORIES as readonly string[]).includes(category)) {
    return { error: "Choose ID proof, Tax or Other for your personal documents." };
  }
  if (manages && targetId === null && !(COMPANY_DOCUMENT_CATEGORIES as readonly string[]).includes(category)) {
    return { error: "Choose Policy, Handbook or Other for company-wide documents." };
  }
  if (targetId !== null && (!Number.isInteger(targetId) || !listUsers().some((member) => member.id === targetId && member.active))) {
    return { error: "Choose an active team member." };
  }
  if (!file) return { error: "Choose a PDF or image to upload." };

  let storedFile: string | null = null;
  try {
    const upload = await saveUpload("private", file);
    storedFile = upload.file;
    const id = createDocument({
      user_id: targetId,
      title,
      category: category as (typeof DOCUMENT_CATEGORIES)[number],
      file: upload.file,
      original_name: upload.original,
      mime: upload.mime,
      size: file.size,
      uploaded_by: user.id,
    });
    audit(user.name, "uploaded a document", "document", `Document #${id}: ${title}`);
    if (manages && targetId !== null && targetId !== user.id) {
      notify(targetId, "A document was added to your workspace", [`${user.name} uploaded "${title}" to your documents.`], "/admin/documents", "View document");
    }
    refresh();
    return { ok: "Document uploaded." };
  } catch (error) {
    if (storedFile) await deleteUpload("private", storedFile);
    return { error: error instanceof UploadError || error instanceof Error ? error.message : "The document could not be uploaded." };
  }
}

export async function deleteDocumentAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = Number(form.get("id"));
  const document = getDocument(id);
  if (!document || !canDeleteDocument(user, document)) return { error: "Document not found." };
  deleteDocument(id);
  await deleteUpload("private", document.file);
  audit(user.name, "deleted a document", "document", `Document #${id}: ${document.title}`);
  refresh();
  return { ok: "Document deleted." };
}
