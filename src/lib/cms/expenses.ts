import { getDb } from "./db";
import { addDays, localDay } from "./attendance";
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES, MAX_CLAIM_PAISE, type ExpenseCategory, type ExpenseStatus } from "./expense-types";

export { EXPENSE_CATEGORIES, EXPENSE_STATUSES, MAX_CLAIM_PAISE } from "./expense-types";
export type { ExpenseCategory, ExpenseStatus } from "./expense-types";

export interface ExpenseClaim {
  id: number;
  user_id: number;
  spent_on: string;
  category: ExpenseCategory;
  amount_paise: number;
  description: string;
  receipt_file: string | null;
  status: ExpenseStatus;
  decided_by: number | null;
  decided_at: string | null;
  decision_note: string;
  paid_at: string | null;
  created_at: string;
}

export interface ClaimInput {
  spentOn: string;
  category: string;
  amountPaise: number;
  description: string;
  receiptFile?: string | null;
}

export interface ClaimTotals {
  pending: number;
  approvedUnpaid: number;
  paidThisYear: number;
}

function validDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validateClaimInput(input: ClaimInput): Omit<ClaimInput, "receiptFile"> & { description: string; category: ExpenseCategory } {
  const today = localDay();
  if (!validDay(input.spentOn) || input.spentOn > today || input.spentOn < addDays(today, -90)) {
    throw new Error("Choose a valid expense date within the last 90 days.");
  }
  if (!Number.isInteger(input.amountPaise) || input.amountPaise <= 0 || input.amountPaise > MAX_CLAIM_PAISE) {
    throw new Error("Enter an amount greater than ₹0 and no more than ₹10,00,000.");
  }
  if (!(EXPENSE_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new Error("Choose an expense category.");
  }
  const description = input.description.trim();
  if (description.length < 3 || description.length > 300) {
    throw new Error("Add a description between 3 and 300 characters.");
  }
  if (input.receiptFile && !/^[\w-]+\.(pdf|jpg|png|webp)$/.test(input.receiptFile)) {
    throw new Error("The receipt could not be saved.");
  }
  return {
    spentOn: input.spentOn,
    category: input.category as ExpenseCategory,
    amountPaise: input.amountPaise,
    description,
  };
}

function fromRow(row: Record<string, unknown>): ExpenseClaim {
  return {
    id: Number(row.id),
    user_id: Number(row.user_id),
    spent_on: String(row.spent_on),
    category: String(row.category) as ExpenseCategory,
    amount_paise: Number(row.amount_paise),
    description: String(row.description),
    receipt_file: (row.receipt_file as string | null) ?? null,
    status: String(row.status) as ExpenseStatus,
    decided_by: row.decided_by == null ? null : Number(row.decided_by),
    decided_at: (row.decided_at as string | null) ?? null,
    decision_note: String(row.decision_note ?? ""),
    paid_at: (row.paid_at as string | null) ?? null,
    created_at: String(row.created_at),
  };
}

export function submitClaim(userId: number, input: ClaimInput): number {
  if (!Number.isInteger(userId) || userId <= 0) throw new Error("Sign in to submit an expense claim.");
  const valid = validateClaimInput(input);
  const result = getDb()
    .prepare(
      `INSERT INTO expense_claims
       (user_id, spent_on, category, amount_paise, description, receipt_file, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
    )
    .run(userId, valid.spentOn, valid.category, valid.amountPaise, valid.description, input.receiptFile ?? null, new Date().toISOString());
  return Number(result.lastInsertRowid);
}

export function listClaims(filter: { userId?: number; status?: ExpenseStatus; month?: string } = {}): ExpenseClaim[] {
  const where: string[] = [];
  const values: (number | string)[] = [];
  if (filter.userId !== undefined) {
    where.push("user_id = ?");
    values.push(filter.userId);
  }
  if (filter.status && (EXPENSE_STATUSES as readonly string[]).includes(filter.status)) {
    where.push("status = ?");
    values.push(filter.status);
  }
  if (filter.month && /^\d{4}-(0[1-9]|1[0-2])$/.test(filter.month)) {
    where.push("spent_on LIKE ?");
    values.push(`${filter.month}-%`);
  }
  const sql = `SELECT * FROM expense_claims${where.length ? ` WHERE ${where.join(" AND ")}` : ""} ORDER BY spent_on DESC, created_at DESC, id DESC`;
  return getDb()
    .prepare(sql)
    .all(...values)
    .map((row) => fromRow(row as Record<string, unknown>));
}

export function getClaim(id: number): ExpenseClaim | null {
  if (!Number.isInteger(id) || id <= 0) return null;
  const row = getDb().prepare("SELECT * FROM expense_claims WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  return row ? fromRow(row) : null;
}

export function cancelClaim(userId: number, id: number): ExpenseClaim {
  const claim = getClaim(id);
  if (!claim || claim.user_id !== userId) throw new Error("Claim not found.");
  if (claim.status !== "pending") throw new Error("Only pending claims can be cancelled.");
  const result = getDb().prepare("UPDATE expense_claims SET status = 'cancelled' WHERE id = ? AND user_id = ? AND status = 'pending'").run(id, userId);
  if (!result.changes) throw new Error("This claim has already been updated.");
  return getClaim(id)!;
}

export function decideClaim(id: number, approverId: number, decision: "approved" | "rejected", note: string): ExpenseClaim {
  if (decision !== "approved" && decision !== "rejected") throw new Error("Choose approve or reject.");
  const claim = getClaim(id);
  if (!claim) throw new Error("Claim not found.");
  if (claim.user_id === approverId) throw new Error("You cannot approve or reject your own claim.");
  if (claim.status !== "pending") throw new Error("Only pending claims can be decided.");
  const result = getDb()
    .prepare(
      `UPDATE expense_claims
       SET status = ?, decided_by = ?, decided_at = ?, decision_note = ?
       WHERE id = ? AND status = 'pending'`,
    )
    .run(decision, approverId, new Date().toISOString(), note.trim().slice(0, 1000), id);
  if (!result.changes) throw new Error("This claim has already been decided.");
  return getClaim(id)!;
}

export function markPaid(id: number, actorId: number): ExpenseClaim {
  if (!Number.isInteger(actorId) || actorId <= 0) throw new Error("Sign in to record payment.");
  const claim = getClaim(id);
  if (!claim) throw new Error("Claim not found.");
  if (claim.status !== "approved") throw new Error("Only approved claims can be marked paid.");
  const result = getDb()
    .prepare("UPDATE expense_claims SET status = 'paid', paid_at = ? WHERE id = ? AND status = 'approved'")
    .run(new Date().toISOString(), id);
  if (!result.changes) throw new Error("This claim has already been updated.");
  return getClaim(id)!;
}

export function claimTotals(userId: number): ClaimTotals {
  const year = localDay().slice(0, 4);
  const yearStart = new Date(`${year}-01-01T00:00:00+05:30`).toISOString();
  const nextYearStart = new Date(`${Number(year) + 1}-01-01T00:00:00+05:30`).toISOString();
  const row = getDb()
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN status = 'pending' THEN amount_paise ELSE 0 END), 0) AS pending,
         COALESCE(SUM(CASE WHEN status = 'approved' THEN amount_paise ELSE 0 END), 0) AS approved_unpaid,
         COALESCE(SUM(CASE WHEN status = 'paid' AND paid_at >= ? AND paid_at < ? THEN amount_paise ELSE 0 END), 0) AS paid_this_year
       FROM expense_claims WHERE user_id = ?`,
    )
    .get(yearStart, nextYearStart, userId) as Record<string, unknown>;
  return {
    pending: Number(row.pending),
    approvedUnpaid: Number(row.approved_unpaid),
    paidThisYear: Number(row.paid_this_year),
  };
}
