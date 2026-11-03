"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";

import { RateLimiter } from "@/lib/rate-limit";
import {
  audit,
  createUser,
  getUser,
  ownerCount,
  passwordProblem,
  SESSION_COOKIE,
  SESSION_DAYS,
  setPassword,
  signIn,
  signOut,
  updateUser,
  verifyPassword,
  type Role,
} from "@/lib/cms/auth";
import { getDb } from "@/lib/cms/db";
import { slugify } from "@/lib/cms/markdown";
import { CMS_TAGS } from "@/lib/cms/public";
import { requireUser } from "@/lib/cms/session";
import {
  APPLICATION_STATUSES,
  deleteJob,
  deletePost,
  ENQUIRY_STATUSES,
  getJobRecord,
  getPostRecord,
  saveJob,
  savePost,
  slugTaken,
  updateApplication,
  updateEnquiry,
  type JobInput,
  type PostInput,
} from "@/lib/cms/store";
import { saveUpload, UploadError } from "@/lib/cms/uploads";

export interface FormState {
  error?: string;
  fields?: Record<string, string>;
  ok?: string;
}

const text = (form: FormData, key: string, max = 2000) => String(form.get(key) ?? "").trim().slice(0, max);
const lines = (form: FormData, key: string) =>
  text(form, key, 8000)
    .split("\n")
    .map((line) => line.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);

/* -------------------------------------------------------------------------- */
/* Sign in / out                                                               */
/* -------------------------------------------------------------------------- */

const loginLimiter = new RateLimiter({ limit: 8, windowMs: 15 * 60_000 });

export async function loginAction(_previous: FormState, form: FormData): Promise<FormState> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  const limit = loginLimiter.consume(`login:${ip}`);
  if (!limit.ok) return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfter / 60)} minutes.` };

  const result = await signIn(text(form, "email", 254), String(form.get("password") ?? ""));
  if (!result) return { error: "That email and password do not match an active account." };

  (await cookies()).set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  audit(result.user.name, "signed in", "account", result.user.email);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  signOut(jar.get(SESSION_COOKIE)?.value);
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* -------------------------------------------------------------------------- */
/* Posts                                                                       */
/* -------------------------------------------------------------------------- */

export async function savePostAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("posts");
  const id = Number(form.get("id")) || undefined;
  const title = text(form, "title", 200);
  const slug = slugify(text(form, "slug", 120) || title);
  const fields: Record<string, string> = {};
  if (title.length < 5) fields.title = "Give the post a title (at least 5 characters).";
  if (!slug) fields.slug = "Enter a URL slug.";
  else if (slugTaken("posts", slug, id)) fields.slug = "Another post already uses this URL.";
  const body = String(form.get("body") ?? "").slice(0, 200_000);
  const status = form.get("intent") === "publish" ? "published" : form.get("intent") === "draft" ? "draft" : (text(form, "status") as "draft" | "published");
  if (status === "published" && body.trim().length < 50) fields.body = "Write at least a paragraph before publishing.";
  if (Object.keys(fields).length) return { error: "Please fix the highlighted fields.", fields };

  let coverSrc = text(form, "cover_src", 500);
  const cover = form.get("cover");
  if (cover instanceof File && cover.size > 0) {
    try {
      coverSrc = `/media/${(await saveUpload("media", cover)).file}`;
    } catch (error) {
      return { error: error instanceof UploadError ? error.message : "The image could not be saved.", fields: { cover: "Upload failed." } };
    }
  }

  const publishedAt = text(form, "published_at", 30) || new Date().toISOString().slice(0, 10);
  const input: PostInput = {
    slug,
    title,
    excerpt: text(form, "excerpt", 400),
    category: text(form, "category", 60) || "Insights",
    author_name: text(form, "author_name", 80) || user.name,
    author_role: text(form, "author_role", 80),
    cover_src: coverSrc,
    cover_alt: text(form, "cover_alt", 200) || title,
    body,
    seo_title: text(form, "seo_title", 70) || null,
    seo_description: text(form, "seo_description", 170) || null,
    featured: form.get("featured") === "on" ? 1 : 0,
    status,
    published_at: publishedAt,
  };
  const savedId = savePost(input, user.name, id);
  audit(user.name, id ? "updated post" : "created post", "post", `${title} (${status})`);
  updateTag(CMS_TAGS.posts);
  if (!id) redirect(`/admin/posts/${savedId}?saved=1`);
  refresh();
  return { ok: status === "published" ? "Saved and live on the site." : "Draft saved." };
}

export async function deletePostAction(form: FormData): Promise<void> {
  const user = await requireUser("posts");
  const id = Number(form.get("id"));
  const record = getPostRecord(id);
  if (record) {
    deletePost(id);
    audit(user.name, "deleted post", "post", record.title);
    updateTag(CMS_TAGS.posts);
  }
  redirect("/admin/posts");
}

/** Uploads an image for use inside a post body; returns its URL. */
export async function uploadImageAction(form: FormData): Promise<{ url?: string; error?: string }> {
  await requireUser("posts");
  const file = form.get("file");
  if (!(file instanceof File)) return { error: "Choose an image." };
  try {
    return { url: `/media/${(await saveUpload("media", file)).file}` };
  } catch (error) {
    return { error: error instanceof UploadError ? error.message : "Upload failed." };
  }
}

/* -------------------------------------------------------------------------- */
/* Jobs                                                                        */
/* -------------------------------------------------------------------------- */

export async function saveJobAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("jobs");
  const id = Number(form.get("id")) || undefined;
  const title = text(form, "title", 120);
  const slug = slugify(text(form, "slug", 120) || title);
  const summary = text(form, "summary", 300);
  const fields: Record<string, string> = {};
  if (title.length < 3) fields.title = "Enter the job title.";
  if (!slug) fields.slug = "Enter a URL slug.";
  else if (slugTaken("jobs", slug, id)) fields.slug = "Another job already uses this URL.";
  if (summary.length < 30) fields.summary = "Write a one- or two-sentence summary (30+ characters).";
  const responsibilities = lines(form, "responsibilities");
  const requirements = lines(form, "requirements");
  if (responsibilities.length === 0) fields.responsibilities = "Add at least one responsibility.";
  if (requirements.length === 0) fields.requirements = "Add at least one requirement.";
  if (Object.keys(fields).length) return { error: "Please fix the highlighted fields.", fields };

  const status = (["draft", "open", "closed"].includes(text(form, "status")) ? text(form, "status") : "open") as JobInput["status"];
  const input: JobInput = {
    slug,
    title,
    short_title: text(form, "short_title", 60) || null,
    team: text(form, "team", 60) || "Engineering",
    location: text(form, "location", 80) || "Gurugram (on-site)",
    type: text(form, "type", 30) || "Full-time",
    experience: text(form, "experience", 40),
    summary,
    skills: text(form, "skills", 600).split(",").map((skill) => skill.trim()).filter(Boolean),
    responsibilities,
    requirements,
    nice_to_haves: lines(form, "nice_to_haves"),
    status,
    posted_at: text(form, "posted_at", 30) || new Date().toISOString().slice(0, 10),
  };
  const savedId = saveJob(input, user.name, id);
  audit(user.name, id ? "updated job" : "created job", "job", `${title} (${status})`);
  updateTag(CMS_TAGS.jobs);
  if (!id) redirect(`/admin/jobs/${savedId}?saved=1`);
  refresh();
  return { ok: status === "open" ? "Saved and live on the careers page." : "Saved." };
}

export async function deleteJobAction(form: FormData): Promise<void> {
  const user = await requireUser("jobs");
  const id = Number(form.get("id"));
  const record = getJobRecord(id);
  if (record) {
    deleteJob(id);
    audit(user.name, "deleted job", "job", record.title);
    updateTag(CMS_TAGS.jobs);
  }
  redirect("/admin/jobs");
}

/* -------------------------------------------------------------------------- */
/* Applications and enquiries                                                  */
/* -------------------------------------------------------------------------- */

export async function updateApplicationAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("applications");
  const id = Number(form.get("id"));
  const status = text(form, "status");
  if (!APPLICATION_STATUSES.includes(status as (typeof APPLICATION_STATUSES)[number])) return { error: "Unknown status." };
  updateApplication(id, { status, internal_notes: text(form, "internal_notes", 5000) });
  audit(user.name, "updated application", "application", `#${id} → ${status}`);
  refresh();
  return { ok: "Saved." };
}

export async function updateEnquiryAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("enquiries");
  const id = Number(form.get("id"));
  const status = text(form, "status");
  if (!ENQUIRY_STATUSES.includes(status as (typeof ENQUIRY_STATUSES)[number])) return { error: "Unknown status." };
  updateEnquiry(id, { status, internal_notes: text(form, "internal_notes", 5000) });
  audit(user.name, "updated enquiry", "enquiry", `#${id} → ${status}`);
  refresh();
  return { ok: "Saved." };
}

/* -------------------------------------------------------------------------- */
/* Team                                                                        */
/* -------------------------------------------------------------------------- */

const ROLES: Role[] = ["owner", "editor", "hr", "sales"];

export async function createUserAction(_previous: FormState, form: FormData): Promise<FormState> {
  const owner = await requireUser("users");
  const email = text(form, "email", 254).toLowerCase();
  const name = text(form, "name", 80);
  const role = text(form, "role") as Role;
  const password = String(form.get("password") ?? "");
  const fields: Record<string, string> = {};
  if (!/^\S+@\S+\.\S+$/.test(email)) fields.email = "Enter a valid email.";
  if (name.length < 2) fields.name = "Enter a name.";
  if (!ROLES.includes(role)) fields.role = "Choose a role.";
  const problem = passwordProblem(password);
  if (problem) fields.password = problem;
  if (getDb().prepare("SELECT 1 FROM users WHERE email = ?").get(email)) fields.email = "This email already has an account.";
  if (Object.keys(fields).length) return { error: "Please fix the highlighted fields.", fields };
  await createUser({ email, name, role, password });
  audit(owner.name, "added team member", "user", `${name} (${role})`);
  refresh();
  return { ok: `${name} can now sign in at /admin with the password you set.` };
}

export async function updateUserAction(form: FormData): Promise<void> {
  const owner = await requireUser("users");
  const id = Number(form.get("id"));
  const target = getUser(id);
  if (!target) redirect("/admin/users");
  const role = text(form, "role") as Role;
  const active = form.get("active") === "on";
  // Never leave the portal without an active owner.
  const removingOwner = target.role === "owner" && (role !== "owner" || !active);
  if (removingOwner && ownerCount() <= 1) redirect("/admin/users?error=last-owner");
  updateUser(id, { role: ROLES.includes(role) ? role : target.role, active });
  audit(owner.name, "updated team member", "user", `${target.name} → ${role}${active ? "" : " (disabled)"}`);
  redirect("/admin/users");
}

export async function resetUserPasswordAction(_previous: FormState, form: FormData): Promise<FormState> {
  const owner = await requireUser("users");
  const id = Number(form.get("id"));
  const password = String(form.get("password") ?? "");
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  await setPassword(id, password);
  audit(owner.name, "reset password", "user", `#${id}`);
  return { ok: "Password updated; they have been signed out everywhere." };
}

export async function changeOwnPasswordAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const row = getDb().prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as { password_hash: string };
  if (!(await verifyPassword(current, row.password_hash))) return { error: "Your current password is not correct." };
  const problem = passwordProblem(next);
  if (problem) return { error: problem };
  if (next !== String(form.get("confirm") ?? "")) return { error: "The new passwords do not match." };
  await setPassword(user.id, next);
  audit(user.name, "changed password", "account", user.email);
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login?changed=1");
}
