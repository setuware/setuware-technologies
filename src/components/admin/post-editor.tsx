"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { Bold, Code2, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Info, Quote } from "lucide-react";

import { savePostAction, uploadImageAction, type FormState } from "@/app/admin/actions";
import { markdownToBlocks, readingMinutes, slugify } from "@/lib/cms/markdown";
import { cn } from "@/lib/utils";
import { PostBody } from "@/components/blog/blocks";

import { FieldError, FormMessage, Label, SubmitButton } from "./form-bits";
import { buttonClass, Card, inputClass } from "./ui";

export interface PostDraft {
  id?: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author_name: string;
  author_role: string;
  cover_src: string;
  cover_alt: string;
  body: string;
  seo_title: string;
  seo_description: string;
  featured: boolean;
  status: "draft" | "published";
  published_at: string;
}

const TOOLS = [
  { Icon: Heading2, label: "Heading", before: "\n## ", after: "", block: true },
  { Icon: Heading3, label: "Subheading", before: "\n### ", after: "", block: true },
  { Icon: Bold, label: "Bold", before: "**", after: "**" },
  { Icon: Italic, label: "Italic", before: "*", after: "*" },
  { Icon: Link2, label: "Link", before: "[", after: "](https://)" },
  { Icon: List, label: "Bullet list", before: "\n- ", after: "", block: true },
  { Icon: ListOrdered, label: "Numbered list", before: "\n1. ", after: "", block: true },
  { Icon: Quote, label: "Quote", before: "\n> ", after: "", block: true },
  { Icon: Info, label: "Callout", before: "\n> [!NOTE]\n> ", after: "", block: true },
  { Icon: Code2, label: "Code", before: "\n```\n", after: "\n```\n", block: true },
] as const;

export function PostEditor({ initial, categories }: { initial: PostDraft; categories: string[] }) {
  const [state, action] = useActionState<FormState, FormData>(savePostAction, {});
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial.id));
  const [body, setBody] = useState(initial.body);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [seoTitle, setSeoTitle] = useState(initial.seo_title);
  const [seoDescription, setSeoDescription] = useState(initial.seo_description);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [coverPreview, setCoverPreview] = useState(initial.cover_src);
  const [uploading, setUploading] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const blocks = useMemo(() => markdownToBlocks(body), [body]);
  const f = state.fields ?? {};

  const insert = (before: string, after = "") => {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = body.slice(start, end);
    const next = body.slice(0, start) + before + selected + after + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + before.length + selected.length;
    });
  };

  const uploadInline = async (file: File) => {
    setUploading(true);
    const data = new FormData();
    data.set("file", file);
    const result = await uploadImageAction(data);
    setUploading(false);
    if (result.url) insert(`\n![${file.name.replace(/\.[^.]+$/, "")}](${result.url} "Caption")\n`);
    else alert(result.error ?? "Upload failed.");
  };

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="body" value={body} />
      <input type="hidden" name="cover_src" value={initial.cover_src} />

      <div className="flex min-w-0 flex-col gap-5">
        <FormMessage state={state} />
        <Card className="p-5">
          <Label htmlFor="title" error={f.title}>Title</Label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (!slugEdited) setSlug(slugify(event.target.value));
            }}
            placeholder="How to plan a website redesign"
            className={cn(inputClass, "text-base font-semibold")}
          />
          <FieldError message={f.title} />
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="shrink-0 text-muted-foreground">setuware.in/blog/</span>
            <input
              name="slug"
              value={slug}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(slugify(event.target.value));
              }}
              aria-label="URL slug"
              className={cn(inputClass, "py-1.5")}
            />
          </div>
          <FieldError message={f.slug} />
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-1 border-b border-border px-3 py-2">
            <div className="mr-2 flex rounded-full bg-foreground/[0.05] p-0.5">
              {(["write", "preview"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                    tab === key ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground",
                  )}
                >
                  {key}
                </button>
              ))}
            </div>
            {tab === "write"
              ? TOOLS.map(({ Icon, label, before, after }) => (
                  <button
                    key={label}
                    type="button"
                    title={label}
                    aria-label={label}
                    onClick={() => insert(before, after)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </button>
                ))
              : null}
            {tab === "write" ? (
              <>
                <button
                  type="button"
                  title="Insert image"
                  aria-label="Insert image"
                  onClick={() => imageRef.current?.click()}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  <ImagePlus className="size-4" />
                </button>
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadInline(file);
                    event.target.value = "";
                  }}
                />
              </>
            ) : null}
            <span className="ml-auto text-xs text-muted-foreground">
              {uploading ? "Uploading image…" : `${readingMinutes(body)} min read · ${body.split(/\s+/).filter(Boolean).length} words`}
            </span>
          </div>
          {tab === "write" ? (
            <textarea
              ref={bodyRef}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={26}
              placeholder={"Start writing in Markdown.\n\n## A heading\n\nA paragraph with **bold** and a [link](https://setuware.in).\n\n- A bullet\n- Another bullet"}
              className="block w-full resize-y bg-surface px-5 py-4 font-mono text-[0.88rem] leading-relaxed text-foreground outline-none"
            />
          ) : (
            <div className="max-h-[42rem] overflow-y-auto px-6 py-6">
              {blocks.length ? <PostBody blocks={blocks} /> : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
            </div>
          )}
        </Card>
        <FieldError message={f.body} />

        <Card className="p-5">
          <Label htmlFor="excerpt" counter={{ value: excerpt.length, max: 220 }}>
            Excerpt
          </Label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={3}
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            placeholder="One or two sentences shown on the blog list and homepage."
            className={inputClass}
          />
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Search engine listing</h3>
          <div className="mb-4 rounded-xl border border-border bg-background p-4">
            <p className="truncate text-[0.95rem] text-[#1a0dab] dark:text-[#8ab4f8]">{seoTitle || title || "Post title"} | Setuware</p>
            <p className="truncate text-xs text-emerald-700 dark:text-emerald-400">setuware.in › blog › {slug || "post-url"}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{seoDescription || excerpt || "The meta description appears here."}</p>
          </div>
          <Label htmlFor="seo_title" hint="optional" counter={{ value: seoTitle.length, max: 50 }}>
            SEO title
          </Label>
          <input id="seo_title" name="seo_title" value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} className={inputClass} />
          <div className="mt-4">
            <Label htmlFor="seo_description" hint="120–155 characters" counter={{ value: seoDescription.length, max: 155 }}>
              Meta description
            </Label>
            <textarea
              id="seo_description"
              name="seo_description"
              rows={2}
              value={seoDescription}
              onChange={(event) => setSeoDescription(event.target.value)}
              className={inputClass}
            />
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-5 xl:sticky xl:top-6 xl:self-start">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Publish</h3>
          <input type="hidden" name="status" value={initial.status} />
          <p className="mb-3 text-xs text-muted-foreground">
            Currently <strong className="text-foreground">{initial.id ? initial.status : "not saved"}</strong>. A future date schedules the post.
          </p>
          <Label htmlFor="published_at">Publish date</Label>
          <input id="published_at" name="published_at" type="date" defaultValue={initial.published_at.slice(0, 10)} className={inputClass} />
          <label className="mt-4 flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" name="featured" defaultChecked={initial.featured} className="size-4 accent-[#2f56d8]" />
            Feature on the blog page
          </label>
          <div className="mt-5 flex flex-col gap-2">
            <SubmitButton name="intent" value="publish" pendingLabel="Publishing…">
              {initial.status === "published" ? "Update and keep live" : "Publish"}
            </SubmitButton>
            <SubmitButton name="intent" value="draft" variant="secondary" pendingLabel="Saving…">
              {initial.status === "published" ? "Unpublish (move to drafts)" : "Save draft"}
            </SubmitButton>
            {initial.id && initial.status === "published" ? (
              <a href={`/blog/${initial.slug}`} target="_blank" rel="noreferrer" className={cn(buttonClass.secondary, "border-transparent")}>
                View on site ↗
              </a>
            ) : null}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Cover image</h3>
          {coverPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview of an upload
            <img src={coverPreview} alt="" className="mb-3 aspect-[3/2] w-full rounded-xl border border-border object-cover" />
          ) : null}
          <input
            name="cover"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setCoverPreview(URL.createObjectURL(file));
            }}
            className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-foreground/[0.07] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground"
          />
          <FieldError message={f.cover} />
          <p className="mt-2 text-xs text-muted-foreground">JPG, PNG or WebP, 1200×800 or larger, up to 5 MB.</p>
          <div className="mt-3">
            <Label htmlFor="cover_alt">Image description (alt text)</Label>
            <input id="cover_alt" name="cover_alt" defaultValue={initial.cover_alt} className={inputClass} />
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Details</h3>
          <Label htmlFor="category">Category</Label>
          <input id="category" name="category" list="categories" defaultValue={initial.category} className={inputClass} />
          <datalist id="categories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
          <div className="mt-3">
            <Label htmlFor="author_name">Author</Label>
            <input id="author_name" name="author_name" defaultValue={initial.author_name} className={inputClass} />
          </div>
          <div className="mt-3">
            <Label htmlFor="author_role">Author role</Label>
            <input id="author_role" name="author_role" defaultValue={initial.author_role} placeholder="Founder" className={inputClass} />
          </div>
        </Card>
      </div>
    </form>
  );
}
