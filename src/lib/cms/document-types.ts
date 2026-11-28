export const DOCUMENT_CATEGORIES = ["Policy", "Handbook", "Payslip", "Offer letter", "Contract", "ID proof", "Tax", "Other"] as const;
export const COMPANY_DOCUMENT_CATEGORIES = ["Policy", "Handbook", "Other"] as const;
export const EMPLOYEE_DOCUMENT_CATEGORIES = ["ID proof", "Tax", "Other"] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
