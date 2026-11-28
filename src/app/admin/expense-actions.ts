"use server";

import { refresh } from "next/cache";

import { audit, getUser } from "@/lib/cms/auth";
import { approversFor, mayApproveFor, notify } from "@/lib/cms/notify";
import { cancelClaim, decideClaim, getClaim, markPaid, submitClaim } from "@/lib/cms/expenses";
import { parseAmountPaise } from "@/lib/cms/expense-types";
import { deleteUpload, saveUpload, UploadError } from "@/lib/cms/uploads";
import { requireUser } from "@/lib/cms/session";

import type { FormState } from "./actions";

const text = (form: FormData, key: string, max = 2000) => String(form.get(key) ?? "").trim().slice(0, max);
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

export async function submitClaimAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const receiptValue = form.get("receipt");
  const receipt = typeof File !== "undefined" && receiptValue instanceof File && receiptValue.size > 0 ? receiptValue : null;
  if (receipt && receipt.size > MAX_RECEIPT_BYTES) return { error: "Receipts must be 5 MB or smaller." };
  const spentOn = text(form, "spent_on", 10);

  let receiptFile: string | null = null;
  try {
    if (receipt) receiptFile = (await saveUpload("private", receipt)).file;
    const id = submitClaim(user.id, {
      spentOn,
      category: text(form, "category", 40),
      amountPaise: parseAmountPaise(text(form, "amount", 20)),
      description: text(form, "description", 1000),
      receiptFile,
    });
    audit(user.name, "submitted an expense claim", "expense claim", `Claim #${id}`);
    for (const approver of approversFor(user.id, "expenses.approve")) {
      notify(approver.id, `Expense claim: ${user.name}`, [`${user.name} submitted a ${text(form, "category", 40)} claim for ₹${(parseAmountPaise(text(form, "amount", 20)) / 100).toFixed(2)}.`], `/admin/expenses/team?month=${spentOn.slice(0, 7)}`, "Review claim");
    }
    refresh();
    return { ok: "Your expense claim has been submitted." };
  } catch (error) {
    if (receiptFile) await deleteUpload("private", receiptFile);
    return { error: error instanceof UploadError || error instanceof Error ? error.message : "The claim could not be submitted." };
  }
}

export async function cancelClaimAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = Number(form.get("id"));
  try {
    cancelClaim(user.id, id);
    audit(user.name, "cancelled an expense claim", "expense claim", `Claim #${id}`);
    refresh();
    return { ok: "Claim cancelled." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The claim could not be cancelled." };
  }
}

export async function decideClaimAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = Number(form.get("id"));
  const claim = getClaim(id);
  if (!claim || !mayApproveFor(user, claim.user_id, "expenses.approve")) return { error: "Claim not found." };
  const decision = text(form, "decision", 20);
  if (decision !== "approved" && decision !== "rejected") return { error: "Choose approve or reject." };
  try {
    const updated = decideClaim(id, user.id, decision, text(form, "note", 1000));
    const claimant = getUser(updated.user_id);
    audit(user.name, `${decision} an expense claim`, "expense claim", `Claim #${id}`);
    notify(updated.user_id, `Expense claim ${decision}`, [`${user.name} ${decision} your ₹${(updated.amount_paise / 100).toFixed(2)} ${updated.category.toLowerCase()} claim.`, updated.decision_note], "/admin/expenses", "View my expenses");
    refresh();
    return { ok: claimant ? `Claim ${decision}. ${claimant.name} has been notified.` : `Claim ${decision}.` };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "The claim could not be decided." };
  }
}

export async function markClaimPaidAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = Number(form.get("id"));
  const claim = getClaim(id);
  if (!claim || !mayApproveFor(user, claim.user_id, "expenses.approve")) return { error: "Claim not found." };
  try {
    const updated = markPaid(id, user.id);
    audit(user.name, "marked an expense claim paid", "expense claim", `Claim #${id}`);
    notify(updated.user_id, "Expense claim paid", [`${user.name} marked your ₹${(updated.amount_paise / 100).toFixed(2)} ${updated.category.toLowerCase()} claim as paid.`], "/admin/expenses", "View my expenses");
    refresh();
    return { ok: "Payment recorded. The employee has been notified." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Payment could not be recorded." };
  }
}
