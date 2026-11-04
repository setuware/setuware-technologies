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
  getApplication,
  getEnquiry,
  getJobRecord,
  getPostRecord,
  jobLists,
  saveJob,
  savePost,
  slugTaken,
  type ApplicationRecord,
  type EnquiryRecord,
  type JobInput,
  type PostInput,
} from "@/lib/cms/store";
import { saveUpload, UploadError } from "@/lib/cms/uploads";
import {
  addNote,
  bulkStatus,
  deleteMedia,
  deleteSubscriber,
  deleteTemplate,
  saveTemplate,
  setAssignee,
  setFollowUp,
  setInterview,
  setRating,
  setSetting,
  setStatus,
} from "@/lib/cms/crm";
import { emailConfigured, getTransporter, senderAddress } from "@/lib/lead-email";
import { site } from "@/lib/site";

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

/* -------------------------------------------------------------------------- */
/* Team workflow: timeline, e-mail, assignment, bulk, duplicates, settings     */
/* -------------------------------------------------------------------------- */

type Entity = "enquiry" | "application";
const AREA: Record<Entity, "enquiries" | "applications"> = { enquiry: "enquiries", application: "applications" };

function entityOf(form: FormData): Entity {
  return form.get("entity") === "application" ? "application" : "enquiry";
}

export async function addNoteAction(_previous: FormState, form: FormData): Promise<FormState> {
  const entity = entityOf(form);
  const user = await requireUser(AREA[entity]);
  const body = text(form, "body", 5000);
  if (body.length < 2) return { error: "Write a note first." };
  addNote(entity, Number(form.get("id")), "note", user.name, body);
  refresh();
  return { ok: "Note added." };
}

/** Status, owner, follow-up date (enquiries) or rating and interview (applications). */
export async function updateRecordAction(_previous: FormState, form: FormData): Promise<FormState> {
  const entity = entityOf(form);
  const user = await requireUser(AREA[entity]);
  const id = Number(form.get("id"));
  const record = entity === "enquiry" ? getEnquiry(id) : getApplication(id);
  if (!record) return { error: "Record not found." };
  const allowed: readonly string[] = entity === "enquiry" ? ENQUIRY_STATUSES : APPLICATION_STATUSES;

  const status = text(form, "status");
  if (status && allowed.includes(status) && status !== record.status) {
    setStatus(entity, id, status);
    addNote(entity, id, "status", user.name, `Status changed from ${record.status} to ${status}`);
  }
  const assignee = text(form, "assignee", 80) || null;
  if (assignee !== (record.assignee ?? null)) {
    setAssignee(entity, id, assignee);
    addNote(entity, id, "assign", user.name, assignee ? `Assigned to ${assignee}` : "Unassigned");
  }
  if (entity === "enquiry") {
    const followUp = text(form, "follow_up_at", 10) || null;
    if (followUp !== ((record as EnquiryRecord).follow_up_at ?? null)) {
      setFollowUp(id, followUp);
      addNote(entity, id, "system", user.name, followUp ? `Follow-up set for ${followUp}` : "Follow-up cleared");
    }
  } else {
    const rating = Number(form.get("rating")) || null;
    if (rating !== ((record as ApplicationRecord).rating ?? null)) setRating(id, rating && rating >= 1 && rating <= 5 ? rating : null);
    const interview = text(form, "interview_at", 16) || null;
    if (interview !== ((record as ApplicationRecord).interview_at ?? null)) {
      setInterview(id, interview);
      addNote(entity, id, "system", user.name, interview ? `Interview scheduled for ${interview.replace("T", " ")}` : "Interview cleared");
    }
  }
  audit(user.name, `updated ${entity}`, entity, `#${id}`);
  refresh();
  return { ok: "Saved." };
}

export async function sendEmailAction(_previous: FormState, form: FormData): Promise<FormState> {
  const entity = entityOf(form);
  const user = await requireUser(AREA[entity]);
  const id = Number(form.get("id"));
  const record = entity === "enquiry" ? getEnquiry(id) : getApplication(id);
  if (!record?.email) return { error: "This record has no email address." };
  const subject = text(form, "subject", 200);
  const body = String(form.get("body") ?? "").trim().slice(0, 20_000);
  if (subject.length < 3 || body.length < 10) return { error: "Add a subject and a message." };
  if (!emailConfigured()) return { error: "Email is not set up on the server (SMTP settings)." };
  try {
    await getTransporter().sendMail({
      from: { name: `${user.name} | ${site.name}`, address: senderAddress() },
      to: record.email,
      replyTo: user.email,
      subject,
      text: body,
    });
  } catch (error) {
    return { error: `Email could not be sent: ${error instanceof Error ? error.message : "unknown error"}` };
  }
  addNote(entity, id, "email", user.name, `Emailed: ${subject}\n\n${body}`);
  if (entity === "enquiry" && record.status === "new") {
    setStatus(entity, id, "contacted");
    addNote(entity, id, "status", user.name, "Status changed from new to contacted");
  }
  audit(user.name, "sent email", entity, `${record.email}: ${subject}`);
  refresh();
  return { ok: `Sent to ${record.email}.` };
}

export async function bulkStatusAction(form: FormData): Promise<void> {
  const entity = entityOf(form);
  const user = await requireUser(AREA[entity]);
  const status = text(form, "bulk_status");
  const allowed: readonly string[] = entity === "enquiry" ? ENQUIRY_STATUSES : APPLICATION_STATUSES;
  const ids = form.getAll("ids").map(Number).filter(Boolean).slice(0, 500);
  if (ids.length && allowed.includes(status)) {
    bulkStatus(entity, ids, status, user.name);
    audit(user.name, "bulk update", entity, `${ids.length} → ${status}`);
  }
  refresh();
}

export async function duplicatePostAction(form: FormData): Promise<void> {
  const user = await requireUser("posts");
  const post = getPostRecord(Number(form.get("id")));
  if (!post) redirect("/admin/posts");
  let slug = `${post.slug}-copy`;
  for (let n = 2; slugTaken("posts", slug); n += 1) slug = `${post.slug}-copy-${n}`;
  const { id: _id, created_at: _c, updated_at: _u, updated_by: _b, ...rest } = post;
  const newId = savePost({ ...rest, slug, title: `${post.title} (copy)`, status: "draft" }, user.name);
  audit(user.name, "duplicated post", "post", post.title);
  redirect(`/admin/posts/${newId}`);
}

export async function duplicateJobAction(form: FormData): Promise<void> {
  const user = await requireUser("jobs");
  const job = getJobRecord(Number(form.get("id")));
  if (!job) redirect("/admin/jobs");
  let slug = `${job.slug}-copy`;
  for (let n = 2; slugTaken("jobs", slug); n += 1) slug = `${job.slug}-copy-${n}`;
  const lists = jobLists(job);
  const newId = saveJob(
    {
      slug,
      title: `${job.title} (copy)`,
      short_title: job.short_title,
      team: job.team,
      location: job.location,
      type: job.type,
      experience: job.experience,
      summary: job.summary,
      ...lists,
      status: "draft",
      posted_at: new Date().toISOString().slice(0, 10),
    },
    user.name,
  );
  audit(user.name, "duplicated job", "job", job.title);
  redirect(`/admin/jobs/${newId}`);
}

export async function saveTemplateAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("templates");
  const name = text(form, "name", 80);
  const subject = text(form, "subject", 200);
  const body = String(form.get("body") ?? "").trim().slice(0, 10_000);
  const audience = form.get("audience") === "application" ? "application" : "enquiry";
  if (name.length < 3 || subject.length < 3 || body.length < 10) return { error: "Fill in the name, subject and message." };
  const id = Number(form.get("id")) || undefined;
  saveTemplate({ name, audience, subject, body }, id);
  audit(user.name, id ? "updated template" : "created template", "template", name);
  refresh();
  return { ok: "Template saved." };
}

export async function deleteTemplateAction(form: FormData): Promise<void> {
  const user = await requireUser("templates");
  deleteTemplate(Number(form.get("id")));
  audit(user.name, "deleted template", "template", `#${form.get("id")}`);
  refresh();
}

export async function deleteSubscriberAction(form: FormData): Promise<void> {
  const user = await requireUser("subscribers");
  deleteSubscriber(Number(form.get("id")));
  audit(user.name, "removed subscriber", "subscriber", `#${form.get("id")}`);
  refresh();
}

export async function deleteMediaAction(form: FormData): Promise<void> {
  const user = await requireUser("media");
  const name = text(form, "name", 120);
  await deleteMedia(name);
  audit(user.name, "deleted image", "media", name);
  refresh();
}

export async function saveAnnouncementAction(_previous: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser("settings");
  const value = {
    enabled: form.get("enabled") === "on",
    text: text(form, "text", 160),
    link: text(form, "link", 300),
    linkLabel: text(form, "linkLabel", 40),
  };
  if (value.enabled && value.text.length < 3) return { error: "Write the announcement text first." };
  if (value.link && !/^(\/|https?:\/\/)/.test(value.link)) return { error: "Links must start with / or https://" };
  setSetting("announcement", value);
  audit(user.name, "updated announcement", "settings", value.enabled ? value.text : "off");
  updateTag(CMS_TAGS.settings);
  return { ok: value.enabled ? "Announcement is live on the website." : "Announcement turned off." };
}
