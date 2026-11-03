import { requireUser } from "@/lib/cms/session";
import { listPostRecords } from "@/lib/cms/store";
import { PostEditor } from "@/components/admin/post-editor";
import { PageHeader } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function NewPostPage() {
  const user = await requireUser("posts");
  const categories = [...new Set(listPostRecords().map((post) => post.category))];
  return (
    <>
      <PageHeader title="New post" back={{ href: "/admin/posts", label: "All posts" }} />
      <PostEditor
        categories={categories}
        initial={{
          slug: "",
          title: "",
          excerpt: "",
          category: categories[0] ?? "Insights",
          author_name: user.name,
          author_role: "",
          cover_src: "",
          cover_alt: "",
          body: "",
          seo_title: "",
          seo_description: "",
          featured: false,
          status: "draft",
          published_at: new Date().toISOString().slice(0, 10),
        }}
      />
    </>
  );
}
