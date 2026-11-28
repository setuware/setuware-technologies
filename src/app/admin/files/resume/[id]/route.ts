import { can, seesAll } from "@/lib/cms/auth";
import { currentVerifiedUser } from "@/lib/cms/session";
import { getApplication } from "@/lib/cms/store";
import { readUpload } from "@/lib/cms/uploads";

/** CV download for signed-in staff with access to applications. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentVerifiedUser();
  if (!user || !can(user, "applications")) return new Response("Not found", { status: 404 });
  const { id } = await params;
  const item = getApplication(Number(id));
  if (!item?.resume_file || (!seesAll(user, "applications") && item.assignee !== user.name)) return new Response("Not found", { status: 404 });
  const file = await readUpload("resumes", item.resume_file);
  if (!file) return new Response("Not found", { status: 404 });
  const ext = item.resume_file.split(".").pop();
  const name = `${item.name.replace(/[^\w ]+/g, "").trim().replace(/\s+/g, "-") || "candidate"}-CV.${ext}`;
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "content-type": file.mime,
      "content-disposition": `attachment; filename="${name}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
