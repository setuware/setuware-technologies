import { can, type AdminUser } from "./auth";
import { getDb } from "./db";
import { DOCUMENT_CATEGORIES, type DocumentCategory } from "./document-types";

export { DOCUMENT_CATEGORIES, EMPLOYEE_DOCUMENT_CATEGORIES } from "./document-types";
export type { DocumentCategory } from "./document-types";

export interface CompanyDocument {
  id: number;
  user_id: number | null;
  title: string;
  category: DocumentCategory;
  file: string;
  original_name: string;
  mime: string;
  size: number;
  uploaded_by: number;
  created_at: string;
}

function fromRow(row: Record<string, unknown>): CompanyDocument {
  return {
    id: Number(row.id),
    user_id: row.user_id == null ? null : Number(row.user_id),
    title: String(row.title),
    category: String(row.category) as DocumentCategory,
    file: String(row.file),
    original_name: String(row.original_name),
    mime: String(row.mime),
    size: Number(row.size),
    uploaded_by: Number(row.uploaded_by),
    created_at: String(row.created_at),
  };
}

export function canReadDocument(user: Pick<AdminUser, "id" | "permissions">, document: Pick<CompanyDocument, "user_id">): boolean {
  return document.user_id === null || document.user_id === user.id || can(user, "documents.manage");
}

export function canDeleteDocument(
  user: Pick<AdminUser, "id" | "permissions">,
  document: Pick<CompanyDocument, "user_id" | "uploaded_by">,
): boolean {
  return can(user, "documents.manage") || (document.user_id === user.id && document.uploaded_by === user.id);
}

export function listDocuments(filter: { userId?: number | null; category?: DocumentCategory } = {}): CompanyDocument[] {
  const where: string[] = [];
  const values: (number | string)[] = [];
  if (filter.userId === null) where.push("user_id IS NULL");
  else if (filter.userId !== undefined) {
    where.push("user_id = ?");
    values.push(filter.userId);
  }
  if (filter.category && (DOCUMENT_CATEGORIES as readonly string[]).includes(filter.category)) {
    where.push("category = ?");
    values.push(filter.category);
  }
  const rows = getDb()
    .prepare(`SELECT * FROM documents${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY category, title COLLATE NOCASE, id DESC`)
    .all(...values) as Record<string, unknown>[];
  return rows.map(fromRow);
}

export function getDocument(id: number): CompanyDocument | null {
  if (!Number.isInteger(id) || id <= 0) return null;
  const row = getDb().prepare("SELECT * FROM documents WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? fromRow(row) : null;
}

export function createDocument(input: Omit<CompanyDocument, "id" | "created_at">): number {
  const result = getDb()
    .prepare(
      `INSERT INTO documents (user_id, title, category, file, original_name, mime, size, uploaded_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(input.user_id, input.title, input.category, input.file, input.original_name, input.mime, input.size, input.uploaded_by, new Date().toISOString());
  return Number(result.lastInsertRowid);
}

export function deleteDocument(id: number): void {
  getDb().prepare("DELETE FROM documents WHERE id = ?").run(id);
}
