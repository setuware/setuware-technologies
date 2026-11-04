import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { can, SESSION_COOKIE, userForToken, type AdminUser } from "./auth";

/** The signed-in admin for this request, or null. */
export async function currentUser(): Promise<AdminUser | null> {
  // Admin pages are always rendered per request.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return userForToken(token);
}

/**
 * Signed-in admin allowed to use `area`; otherwise redirects. People with a
 * temporary password are sent to My account until they choose their own.
 */
export async function requireUser(area?: string, options: { allowPasswordChange?: boolean } = {}): Promise<AdminUser> {
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword && !options.allowPasswordChange) redirect("/admin/account?required=1");
  if (area && !can(user.role, area)) redirect("/admin?denied=1");
  return user;
}
