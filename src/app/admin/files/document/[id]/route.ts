import { canReadDocument, getDocument } from "@/lib/cms/documents";
import { currentVerifiedUser } from "@/lib/cms/session";
import { readUpload } from "@/lib/cms/uploads";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentVerifiedUser();
  if (!user) return new Response("Not found", { status: 404 });
  const document = getDocument(Number((await params).id));
  if (!document || !canReadDocument(user, document)) return new Response("Not found", { status: 404 });
  const file = await readUpload("private", document.file);
  if (!file) return new Response("Not found", { status: 404 });
  const name = document.original_name.replace(/[^\w .()-]/g, "_").replace(/["\\]/g, "_") || `document.${document.file.split(".").pop()}`;
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "content-type": file.mime,
      "content-disposition": `attachment; filename="${name}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
