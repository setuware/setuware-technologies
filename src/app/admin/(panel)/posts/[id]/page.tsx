import { notFound } from "next/navigation";

import { deletePostAction, duplicatePostAction } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/form-bits";
import { requireUser } from "@/lib/cms/session";
import { getPostRecord, listPostRecords } from "@/lib/cms/store";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { PostEditor } from "@/components/admin/post-editor";
import { formatWhen, PageHeader } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireUser("posts");
  const { id } = await params;
  const { saved } = await searchParams;
  const post = getPostRecord(Number(id));
  if (!post) notFound();
  const categories = [...new Set(listPostRecords().map((item) => item.category))];

  return (
    <>
      <PageHeader
        title="Edit post"
        description={`Last saved ${formatWhen(post.updated_at)}${post.updated_by ? ` by ${post.updated_by}` : ""}`}
        back={{ href: "/admin/posts", label: "All posts" }}
        actions={
          <>
            <form action={duplicatePostAction}>
              <input type="hidden" name="id" value={post.id} />
              <SubmitButton variant="secondary" pendingLabel="Copying…">
                Duplicate
              </SubmitButton>
            </form>
            <ConfirmDelete action={deletePostAction} id={post.id} label="Delete post" what={post.title} />
          </>
        }
      />
      {saved ? (
        <p className="mb-5 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          {post.status === "published" ? "Published." : "Draft created."}
        </p>
      ) : null}
      <PostEditor
        key={post.updated_at}
        categories={categories}
        initial={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          category: post.category,
          author_name: post.author_name,
          author_role: post.author_role,
          cover_src: post.cover_src,
          cover_alt: post.cover_alt,
          body: post.body,
          seo_title: post.seo_title ?? "",
          seo_description: post.seo_description ?? "",
          featured: post.featured === 1,
          status: post.status,
          published_at: post.published_at,
        }}
      />
    </>
  );
}
