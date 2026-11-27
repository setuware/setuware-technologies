import { deleteMediaAction } from "@/app/admin/actions";
import { listMedia, mediaUsage } from "@/lib/cms/crm";
import { requireUser } from "@/lib/cms/session";
import { site } from "@/lib/site";
import { CopyButton } from "@/components/admin/copy-button";
import { SubmitButton } from "@/components/admin/form-bits";
import { Card, Empty, PageHeader, timeAgo } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function MediaPage() {
  await requireUser("media");
  const files = await listMedia();

  return (
    <>
      <PageHeader title="Media library" description="Images uploaded for blog posts. Copy a link to reuse an image, or delete ones you no longer need." />
      {files.length === 0 ? (
        <Card>
          <Empty title="No images yet">Upload a cover or an in-article image from the post editor.</Empty>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => {
            const usedIn = mediaUsage(file.name);
            return (
              <Card key={file.name} className="group overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                <img src={file.url} alt="" loading="lazy" className="aspect-[4/3] w-full bg-foreground/[0.04] object-cover" />
                <div className="flex flex-col gap-2 p-3">
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB · {timeAgo(file.modified)}
                  </p>
                  <p className="line-clamp-1 text-xs text-foreground/80">{usedIn.length ? `Used in: ${usedIn.join(", ")}` : "Not used in any post"}</p>
                  <div className="flex gap-2">
                    <CopyButton value={`${site.url}${file.url}`} />
                    {usedIn.length === 0 ? (
                      <form action={deleteMediaAction}>
                        <input type="hidden" name="name" value={file.name} />
                        <SubmitButton variant="danger" className="h-8 px-3 text-xs" pendingLabel="…">
                          Delete
                        </SubmitButton>
                      </form>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
