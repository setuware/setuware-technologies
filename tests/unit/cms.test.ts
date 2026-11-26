import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { postBodies } from "@/lib/post-bodies";
import { posts } from "@/lib/posts";
import { jobs } from "@/lib/careers";
import {
  can,
  seesAll,
  completeTwoFactor,
  createPasswordToken,
  createUser,
  deleteUser,
  enableTwoFactor,
  getUserByEmail,
  hashPassword,
  newTotpSecret,
  passwordProblem,
  pendingTwoFactor,
  signIn,
  signOut,
  totpCode,
  unlockUser,
  redeemPasswordToken,
  userForPasswordToken,
  userForToken,
  verifyPassword,
} from "@/lib/cms/auth";
import { getDb, resetDb } from "@/lib/cms/db";
import { blocksToMarkdown, markdownToBlocks, readingMinutes, slugify } from "@/lib/cms/markdown";
import {
  listEnquiries,
  openJobRecords,
  publishedPostBySlug,
  publishedPostRecords,
  savePost,
  saveEnquiry,
  toJob,
  toPost,
} from "@/lib/cms/store";
import { readUpload, saveUpload, UploadError } from "@/lib/cms/uploads";

beforeEach(() => {
  resetDb();
  vi.unstubAllEnvs();
});

afterEach(() => resetDb());

describe("markdown", () => {
  it("round-trips every existing article without losing blocks", () => {
    for (const [slug, blocks] of Object.entries(postBodies)) {
      expect(markdownToBlocks(blocksToMarkdown(blocks)), slug).toEqual(blocks);
    }
  });

  it("parses headings, lists, quotes, callouts, code and images", () => {
    const blocks = markdownToBlocks(
      [
        "## Title",
        "A paragraph that",
        "wraps.",
        "- one",
        "- two",
        "1. first",
        "> Wise words",
        "> — Satyam",
        "> [!WARNING]",
        "> Careful",
        "```ts",
        "const a = 1;",
        "```",
        '![Team](/media/a.jpg "Our team")',
      ].join("\n"),
    );
    expect(blocks).toEqual([
      { type: "h2", text: "Title" },
      { type: "p", text: "A paragraph that wraps." },
      { type: "ul", items: ["one", "two"] },
      { type: "ol", items: ["first"] },
      { type: "quote", text: "Wise words", cite: "Satyam" },
      { type: "callout", tone: "warn", text: "Careful" },
      { type: "code", language: "ts", code: "const a = 1;" },
      { type: "image", src: "/media/a.jpg", alt: "Team", caption: "Our team" },
    ]);
  });

  it("slugifies and estimates reading time", () => {
    expect(slugify("How to Plan a Website — in 2026!")).toBe("how-to-plan-a-website-in-2026");
    expect(readingMinutes("word ".repeat(660))).toBe(3);
  });
});

describe("database seed", () => {
  it("imports the existing posts and jobs once", () => {
    expect(publishedPostRecords()).toHaveLength(posts.length);
    expect(openJobRecords()).toHaveLength(jobs.length);
    resetDb();
    expect(publishedPostRecords()).toHaveLength(posts.length);
  });

  it("maps database rows to the site's Post and Job shapes", () => {
    const record = publishedPostBySlug(posts[0].slug);
    expect(record).not.toBeNull();
    const post = toPost(record!);
    expect(post).toMatchObject({ slug: posts[0].slug, title: posts[0].title, date: posts[0].date, featured: posts[0].featured });
    const job = toJob(openJobRecords().find((item) => item.slug === jobs[0].slug)!);
    expect(job.responsibilities).toEqual(jobs[0].responsibilities);
  });

  it("hides drafts and scheduled posts from the public site", () => {
    const base = {
      excerpt: "x",
      category: "News",
      author_name: "A",
      author_role: "",
      cover_src: "",
      cover_alt: "",
      body: "Hello world",
      seo_title: null,
      seo_description: null,
      featured: 0,
    };
    savePost({ ...base, slug: "draft-post", title: "Draft", status: "draft", published_at: "2026-01-01" }, "test");
    savePost({ ...base, slug: "future-post", title: "Future", status: "published", published_at: "2999-01-01" }, "test");
    expect(publishedPostBySlug("draft-post")).toBeNull();
    expect(publishedPostBySlug("future-post")).toBeNull();
  });
});

describe("admin auth", () => {
  it("hashes passwords and rejects wrong ones", async () => {
    const hash = await hashPassword("CorrectHorse42");
    expect(hash).toMatch(/^scrypt\$/);
    expect(await verifyPassword("CorrectHorse42", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
    expect(passwordProblem("short1")).not.toBeNull();
    expect(passwordProblem("longenoughpassword")).not.toBeNull();
    expect(passwordProblem("LongEnough123")).toBeNull();
  });

  it("creates the first owner from ADMIN_EMAIL / ADMIN_PASSWORD, then uses real sessions", async () => {
    vi.stubEnv("ADMIN_EMAIL", "owner@example.com");
    vi.stubEnv("ADMIN_PASSWORD", "BootPass12345");
    expect((await signIn("owner@example.com", "nope")).ok).toBe(false);
    const session = await signIn("Owner@Example.com", "BootPass12345");
    if (!session.ok) throw new Error("sign-in failed");
    expect(session.user.role).toBe("owner");
    expect(session.user.mustChangePassword).toBe(false);
    expect(userForToken(session.token)?.email).toBe("owner@example.com");
    // Stored as a hash, never the raw token.
    expect(getDb().prepare("SELECT id FROM sessions").get()).not.toEqual({ id: session.token });
    signOut(session.token);
    expect(userForToken(session.token)).toBeNull();
  });

  it("locks an account after five wrong passwords", async () => {
    await createUser({ email: "a@example.com", name: "A", role: "sales", password: "SalesPass123", temporary: false });
    for (let attempt = 0; attempt < 4; attempt += 1) expect(await signIn("a@example.com", "wrong")).toEqual({ ok: false, reason: "invalid" });
    expect(await signIn("a@example.com", "wrong")).toMatchObject({ ok: false, reason: "locked" });
    expect(await signIn("a@example.com", "SalesPass123")).toMatchObject({ ok: false, reason: "locked" });
    unlockUser(getUserByEmail("a@example.com")!.id);
    expect((await signIn("a@example.com", "SalesPass123")).ok).toBe(true);
  });

  it("asks for a 2-step code before the session works", async () => {
    const user = await createUser({ email: "b@example.com", name: "B", role: "hr", password: "HrPass12345", temporary: false });
    const secret = newTotpSecret();
    expect(enableTwoFactor(user.id, secret, "000000")).toBeNull();
    const codes = enableTwoFactor(user.id, secret, totpCode(secret));
    expect(codes).toHaveLength(8);

    const first = await signIn("b@example.com", "HrPass12345");
    if (!first.ok) throw new Error("sign-in failed");
    expect(first.needsCode).toBe(true);
    expect(userForToken(first.token)).toBeNull();
    expect(pendingTwoFactor(first.token)).toBe(true);
    expect(completeTwoFactor(first.token, "123456")).toBeNull();
    expect(completeTwoFactor(first.token, totpCode(secret))?.email).toBe("b@example.com");
    expect(userForToken(first.token)?.email).toBe("b@example.com");

    // A recovery code works once.
    const second = await signIn("b@example.com", "HrPass12345");
    if (!second.ok) throw new Error("sign-in failed");
    expect(completeTwoFactor(second.token, codes![0])).not.toBeNull();
    const third = await signIn("b@example.com", "HrPass12345");
    if (!third.ok) throw new Error("sign-in failed");
    expect(completeTwoFactor(third.token, codes![0])).toBeNull();
  });

  it("matches the RFC 6238 test vector", () => {
    // Secret "12345678901234567890" in base32, T = 59 s → 94287082 (last 6 digits).
    expect(totpCode("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", 59_000)).toBe("287082");
  });

  it("invites by single-use link and forces temporary passwords to change", async () => {
    const invited = await createUser({ email: "c@example.com", name: "C", role: "editor" });
    expect(invited.hasPassword).toBe(false);
    expect((await signIn("c@example.com", "anything")).ok).toBe(false);
    const token = createPasswordToken(invited.id, "invite");
    expect(userForPasswordToken(token)?.purpose).toBe("invite");
    expect(await redeemPasswordToken(token, "EditorPass123")).not.toBeNull();
    expect(await redeemPasswordToken(token, "EditorPass123")).toBeNull();
    expect((await signIn("c@example.com", "EditorPass123")).ok).toBe(true);

    const temp = await createUser({ email: "d@example.com", name: "D", role: "sales", password: "TempPass1234" });
    expect(temp.mustChangePassword).toBe(true);
  });

  it("limits each role to its permissions", async () => {
    const editor = await createUser({ email: "ed@example.com", name: "Ed", role: "editor", password: "EditorPass123" });
    expect(can(editor, "posts")).toBe(true);
    expect(can(editor, "posts.publish")).toBe(true);
    expect(can(editor, "applications")).toBe(false);
    const exec = await createUser({ email: "ex@example.com", name: "Ex", role: "sales_exec", password: "SalesPass123" });
    expect(can(exec, "leads.edit")).toBe(true);
    expect(seesAll(exec, "leads")).toBe(false);
    expect(can(exec, "users")).toBe(false);
    const owner = await createUser({ email: "ow@example.com", name: "Ow", role: "owner", password: "OwnerPass123" });
    expect(can(owner, "roles.manage")).toBe(true);
    expect(seesAll(owner, "leads")).toBe(true);
  });


  it("removes a member, their sessions and their reports' manager link", async () => {
    const lead = await createUser({ email: "lead@example.com", name: "Lead", role: "sales", password: "SalesPass123", temporary: false });
    const report = await createUser({ email: "rep@example.com", name: "Rep", role: "sales", password: "SalesPass123", temporary: false });
    getDb().prepare("UPDATE users SET manager_id = ? WHERE id = ?").run(lead.id, report.id);
    const session = await signIn("lead@example.com", "SalesPass123");
    if (!session.ok) throw new Error("sign-in failed");
    deleteUser(lead.id);
    expect(getUserByEmail("lead@example.com")).toBeNull();
    expect(userForToken(session.token)).toBeNull();
    expect(getUserByEmail("rep@example.com")!.managerId).toBeNull();
  });
});

describe("enquiries", () => {
  it("stores and searches enquiries", () => {
    saveEnquiry({
      reference: "STW-AAA111",
      kind: "contact",
      source: "Contact form",
      name: "Priya",
      email: "priya@example.com",
      phone: "",
      service: "Website",
      message: "Clinic website",
      payload: "{}",
      created_at: new Date().toISOString(),
    });
    expect(listEnquiries({ q: "clinic" })).toHaveLength(1);
    expect(listEnquiries({ status: "won" })).toHaveLength(0);
  });
});

describe("uploads", () => {
  it("accepts real PDFs and images by content, rejects disguised files", async () => {
    vi.stubEnv("CMS_DATA_DIR", mkdtempSync(path.join(tmpdir(), "cms-")));
    const pdf = new File([new TextEncoder().encode("%PDF-1.4 test")], "cv.pdf");
    const saved = await saveUpload("resumes", pdf);
    expect(saved.file).toMatch(/\.pdf$/);
    expect((await readUpload("resumes", saved.file))?.mime).toBe("application/pdf");

    await expect(saveUpload("resumes", new File(["<html>"], "cv.pdf"))).rejects.toBeInstanceOf(UploadError);
    await expect(saveUpload("media", new File(["%PDF"], "a.jpg"))).rejects.toBeInstanceOf(UploadError);
    expect(await readUpload("resumes", "../../etc/passwd")).toBeNull();
  });
});
