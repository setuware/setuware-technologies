export const EXPENSE_CATEGORIES = ["Travel", "Meals", "Software", "Equipment", "Internet & phone", "Other"] as const;
export const EXPENSE_STATUSES = ["pending", "approved", "rejected", "paid", "cancelled"] as const;
export const MAX_CLAIM_PAISE = 100_000_000;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];
