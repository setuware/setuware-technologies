import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { can, needsTwoFactorSetup, SESSION_COOKIE, userForToken, type AdminUser } from "./auth";
import { getSetting } from "./crm";

/** The signed-in admin for this request, or null. */
export async function currentUser(): Promise<AdminUser | null> {
  // Admin pages are always rendered per request.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return userForToken(token);
}

/** Signed-in admin who has completed required password and 2-step setup. */
export async function currentVerifiedUser(): Promise<AdminUser | null> {
  const user = await currentUser();
  if (!user || user.mustChangePassword || needsTwoFactorSetup(user, getSetting("require2faAdmins", false))) return null;
  return user;
}

/**
 * Signed-in admin allowed to use `area`; otherwise redirects. People with a
 * temporary password are sent to My account until they choose their own.
 */
export async function requireUser(area?: string, options: { allowPasswordChange?: boolean; allowTwoFactorSetup?: boolean } = {}): Promise<AdminUser> {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword && !options.allowPasswordChange) redirect("/admin/account?required=1");
  if (needsTwoFactorSetup(user, getSetting("require2faAdmins", false)) && !options.allowTwoFactorSetup) redirect("/admin/account?twofactor=required");
  if (area && !can(user, area)) redirect("/admin?denied=1");
  return user;
}
