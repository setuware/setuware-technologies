import Link from "next/link";
import { Plus } from "lucide-react";

import { requireUser } from "@/lib/cms/session";
import { listPostRecords } from "@/lib/cms/store";
import { buttonClass, Card, Empty, formatDay, inputClass, PageHeader, StatusBadge } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireUser("posts");
  const { q = "", status = "" } = await searchParams;
  const today = new Date().toISOString();
  const all = listPostRecords();
  const posts = all.filter((post) => {
    const state = post.status === "published" && post.published_at > today ? "scheduled" : post.status;
    if (status && state !== status) return false;
    if (q && !`${post.title} ${post.category} ${post.slug}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <PageHeader
        title="Blog posts"
        description="Write, schedule and publish articles. Published posts appear on /blog instantly."
        actions={
          <Link href="/admin/posts/new" className={buttonClass.primary}>
            <Plus className="size-4" aria-hidden /> New post
          </Link>
        }
      />
      <form className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input name="q" defaultValue={q} placeholder="Search titles, categories…" className={`${inputClass} sm:max-w-xs`} />
        <select name="status" defaultValue={status} className={`${inputClass} sm:w-44`}>
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
        </select>
        <button className={buttonClass.secondary}>Filter</button>
      </form>
      <Card className="overflow-hidden">
        {posts.length === 0 ? (
          <Empty title={all.length ? "No posts match" : "No posts yet"}>
            {all.length ? "Try another search." : "Create your first article."}
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="hidden px-5 py-3 font-medium md:table-cell">Category</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="hidden px-5 py-3 font-medium sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {posts.map((post) => {
                  const state = post.status === "published" && post.published_at > today ? "scheduled" : post.status;
                  return (
                    <tr key={post.id} className="hover:bg-foreground/[0.03]">
                      <td className="px-5 py-3">
                        <Link href={`/admin/posts/${post.id}`} className="font-medium text-foreground hover:underline">
                          {post.title}
                        </Link>
                        <span className="block text-xs text-muted-foreground">/blog/{post.slug}</span>
                      </td>
                      <td className="hidden px-5 py-3 text-muted-foreground md:table-cell">{post.category}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={state} />
                      </td>
                      <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">{formatDay(post.published_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
