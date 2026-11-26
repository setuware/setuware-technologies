import { after } from "next/server";

import { portalLink } from "@/lib/portal";

import { can, getUser, listUsers, reportIds, type AdminUser } from "./auth";
import { sendAccountEmail } from "./mailer";
import { addNotification } from "./notifications";

/**
 * Tells a team member about something: always in the app (the bell), and by
 * e-mail after the response when SMTP is set up.
 */
export function notify(userId: number | null | undefined, subject: string, lines: string[], path: string, label: string, kind = "info"): void {
  if (!userId) return;
  const person = getUser(userId);
  if (!person?.active) return;
  addNotification(userId, subject, lines.filter(Boolean).join(" "), path, kind);
  after(async () => {
    await sendAccountEmail(person.email, subject, lines.filter(Boolean), { url: portalLink(path), label });
  });
}

/** Everyone a request from `requesterId` should go to: their manager plus anyone with `permission`. */
export function approversFor(requesterId: number, permission: string): AdminUser[] {
  const requester = getUser(requesterId);
  return listUsers().filter(
    (member) => member.active && member.id !== requesterId && (member.id === requester?.managerId || can(member, permission)),
  );
}

/**
 * Whose team data a person may see: everyone with `permission`, otherwise the
 * people who report to them (directly or further down).
 */
export function teamScope(user: AdminUser, permission: string): { all: boolean; ids: number[] } {
  if (can(user, permission)) return { all: true, ids: [] };
  return { all: false, ids: reportIds(user.id) };
}

/** May `user` approve something for `memberId`? Managers approve their reports; nobody approves themself except the Owner. */
export function mayApproveFor(user: AdminUser, memberId: number, permission: string): boolean {
  if (memberId === user.id) return user.role === "owner";
  return can(user, permission) || reportIds(user.id).includes(memberId);
}
