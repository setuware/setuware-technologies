import { readUpload } from "@/lib/cms/uploads";

/** Public blog images uploaded in the admin (data/uploads/media). */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const upload = await readUpload("media", file);
  if (!upload) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(upload.bytes), {
    headers: {
      "content-type": upload.mime,
      // Names are random and never reused, so the file can be cached for good.
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
