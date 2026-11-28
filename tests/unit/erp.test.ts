import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { addDays, localDay } from "@/lib/cms/attendance";
import { createUser, getUser, updateProfile } from "@/lib/cms/auth";
import { canDeleteDocument, canReadDocument, type CompanyDocument } from "@/lib/cms/documents";
import { cancelClaim, decideClaim, markPaid, MAX_CLAIM_PAISE, submitClaim, type ClaimInput } from "@/lib/cms/expenses";
import { resetDb } from "@/lib/cms/db";
import { mayApproveFor } from "@/lib/cms/notify";

beforeEach(() => resetDb());
afterEach(() => resetDb());

async function employee() {
  return createUser({ email: `employee-${Math.random()}@example.com`, name: "Employee", role: "developer", password: "EmployeePass123" });
}

const claimInput = (overrides: Partial<ClaimInput> = {}): ClaimInput => ({
  spentOn: localDay(),
  category: "Travel",
  amountPaise: 12500,
  description: "Taxi to client meeting",
  ...overrides,
});

describe("expense claims", () => {
  it("rejects future and older-than-90-day dates", async () => {
    const user = await employee();
    expect(() => submitClaim(user.id, claimInput({ spentOn: addDays(localDay(), 1) }))).toThrow(/expense date/);
    expect(() => submitClaim(user.id, claimInput({ spentOn: addDays(localDay(), -91) }))).toThrow(/expense date/);
    expect(() => submitClaim(user.id, claimInput({ spentOn: "2025-02-30" }))).toThrow(/expense date/);
  });

  it("rejects zero, negative, over-limit amounts and invalid categories", async () => {
    const user = await employee();
    for (const amountPaise of [0, -1, MAX_CLAIM_PAISE + 1]) {
      expect(() => submitClaim(user.id, claimInput({ amountPaise }))).toThrow(/amount greater than/);
    }
    expect(() => submitClaim(user.id, claimInput({ category: "Rent" }))).toThrow(/category/);
  });

  it("allows cancellation only by the claimant while pending", async () => {
    const owner = await employee();
    const other = await employee();
    const id = submitClaim(owner.id, claimInput());

    expect(() => cancelClaim(other.id, id)).toThrow(/Claim not found/);
    expect(cancelClaim(owner.id, id).status).toBe("cancelled");
    expect(() => cancelClaim(owner.id, id)).toThrow(/Only pending/);
  });

  it("allows decisions only for another person's pending claim and pays approved claims", async () => {
    const claimant = await employee();
    const approver = await employee();
    const rejected = submitClaim(claimant.id, claimInput());

    expect(() => decideClaim(rejected, claimant.id, "approved", "")).toThrow(/own claim/);
    expect(decideClaim(rejected, approver.id, "rejected", "Missing receipt").status).toBe("rejected");
    expect(() => decideClaim(rejected, approver.id, "approved", "")).toThrow(/Only pending/);
    expect(() => markPaid(rejected, approver.id)).toThrow(/Only approved/);

    const approved = submitClaim(claimant.id, claimInput());
    expect(decideClaim(approved, approver.id, "approved", "Looks good").status).toBe("approved");
    expect(markPaid(approved, approver.id)).toMatchObject({ status: "paid", paid_at: expect.any(String) });
  });
});

describe("document access", () => {
  it("applies read and delete rules for company and personal documents", async () => {
    const employeeUser = await employee();
    const otherEmployee = await employee();
    const hr = await createUser({ email: "hr@example.com", name: "HR", role: "hr", password: "HrPass123456" });
    const company: CompanyDocument = {
      id: 1,
      user_id: null,
      title: "Handbook",
      category: "Handbook",
      file: "book.pdf",
      original_name: "book.pdf",
      mime: "application/pdf",
      size: 1024,
      uploaded_by: hr.id,
      created_at: new Date().toISOString(),
    };
    const personal: CompanyDocument = { ...company, id: 2, user_id: employeeUser.id, title: "Tax form", category: "Tax", uploaded_by: employeeUser.id };
    const hrUploadedPersonal: CompanyDocument = { ...personal, id: 3, uploaded_by: hr.id };

    expect(canReadDocument(employeeUser, company)).toBe(true);
    expect(canReadDocument(otherEmployee, company)).toBe(true);
    expect(canReadDocument(hr, company)).toBe(true);
    expect(canReadDocument(employeeUser, personal)).toBe(true);
    expect(canReadDocument(otherEmployee, personal)).toBe(false);
    expect(canReadDocument(hr, personal)).toBe(true);
    expect(canReadDocument(employeeUser, hrUploadedPersonal)).toBe(true);

    expect(canDeleteDocument(hr, company)).toBe(true);
    expect(canDeleteDocument(employeeUser, company)).toBe(false);
    expect(canDeleteDocument(employeeUser, personal)).toBe(true);
    expect(canDeleteDocument(otherEmployee, personal)).toBe(false);
    expect(canDeleteDocument(hr, personal)).toBe(true);
    expect(canDeleteDocument(employeeUser, hrUploadedPersonal)).toBe(false);
    expect(canDeleteDocument(hr, hrUploadedPersonal)).toBe(true);
  });
});

describe("manager expense approval", () => {
  it("allows a manager to approve a report's claim through mayApproveFor", async () => {
    const manager = await createUser({ email: "lead@example.com", name: "Lead", role: "tech_lead", password: "LeadPass12345" });
    const report = await employee();
    const other = await employee();
    updateProfile(report.id, {
      designation: "",
      department: "",
      phone: "",
      joinedOn: null,
      birthday: null,
      managerId: manager.id,
    });

    expect(mayApproveFor(getUser(manager.id)!, report.id, "expenses.approve")).toBe(true);
    expect(mayApproveFor(getUser(manager.id)!, other.id, "expenses.approve")).toBe(false);
  });
});
