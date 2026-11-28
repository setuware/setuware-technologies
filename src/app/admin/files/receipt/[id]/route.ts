import { getClaim } from "@/lib/cms/expenses";
import { mayApproveFor, teamScope } from "@/lib/cms/notify";
import { currentVerifiedUser } from "@/lib/cms/session";
import { readUpload } from "@/lib/cms/uploads";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentVerifiedUser();
  if (!user) return new Response("Not found", { status: 404 });
  const claim = getClaim(Number((await params).id));
  if (!claim) return new Response("Not found", { status: 404 });
  const scope = teamScope(user, "expenses");
  const canSeeClaim = claim.user_id === user.id || mayApproveFor(user, claim.user_id, "expenses.approve") || scope.all || scope.ids.includes(claim.user_id);
  if (!canSeeClaim || !claim.receipt_file) return new Response("Not found", { status: 404 });
  const file = await readUpload("private", claim.receipt_file);
  if (!file) return new Response("Not found", { status: 404 });
  const ext = claim.receipt_file.split(".").pop() ?? "pdf";
  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "content-type": file.mime,
      "content-disposition": `attachment; filename="expense-${claim.id}-receipt.${ext}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
