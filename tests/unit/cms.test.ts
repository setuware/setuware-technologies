import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { postBodies } from "@/lib/post-bodies";
import { posts } from "@/lib/posts";
import { jobs } from "@/lib/careers";
import { can, createUser, hashPassword, passwordProblem, signIn, signOut, userForToken, verifyPassword } from "@/lib/cms/auth";
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
    expect(await signIn("owner@example.com", "nope")).toBeNull();
    const session = await signIn("Owner@Example.com", "BootPass12345");
    expect(session?.user.role).toBe("owner");
    expect(userForToken(session!.token)?.email).toBe("owner@example.com");
    // Stored as a hash, never the raw token.
    expect(getDb().prepare("SELECT id FROM sessions").get()).not.toEqual({ id: session!.token });
    signOut(session!.token);
    expect(userForToken(session!.token)).toBeNull();
  });

  it("limits each role to its sections", async () => {
    await createUser({ email: "ed@example.com", name: "Ed", role: "editor", password: "EditorPass123" });
    expect(can("editor", "posts")).toBe(true);
    expect(can("editor", "applications")).toBe(false);
    expect(can("hr", "applications")).toBe(true);
    expect(can("sales", "users")).toBe(false);
    expect(can("owner", "users")).toBe(true);
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
