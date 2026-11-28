import Link from "next/link";
import { FileText } from "lucide-react";

import { DeleteDocumentForm, DocumentUploadForm } from "@/components/admin/document-tools";
import { Card, Empty, PageHeader } from "@/components/admin/ui";
import { can, getUser, listUsers } from "@/lib/cms/auth";
import { canDeleteDocument, DOCUMENT_CATEGORIES, listDocuments, type CompanyDocument } from "@/lib/cms/documents";
import { requireUser } from "@/lib/cms/session";

export const instant = false;

const bytesLabel = (bytes: number) => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function DocumentRow({ document, user }: { document: CompanyDocument; user: Awaited<ReturnType<typeof requireUser>> }) {
  const uploader = getUser(document.uploaded_by);
  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <FileText className="mt-0.5 size-4 shrink-0 text-[#2f56d8] dark:text-[#8fb0ff]" aria-hidden />
        <div className="min-w-0">
          <Link href={`/admin/files/document/${document.id}`} className="break-words font-medium text-foreground hover:underline">{document.title}</Link>
          <p className="mt-0.5 break-all text-xs text-muted-foreground">{document.original_name} · {bytesLabel(document.size)} · Uploaded by {uploader?.name ?? "team member"}</p>
        </div>
      </div>
      {canDeleteDocument(user, document) ? <DeleteDocumentForm id={document.id} /> : null}
    </li>
  );
}

export default async function DocumentsPage({ searchParams }: { searchParams: Promise<{ person?: string }> }) {
  const user = await requireUser();
  const manages = can(user, "documents.manage");
  const people = listUsers().filter((member) => member.active);
  const params = await searchParams;
  const chosen = manages ? people.find((person) => person.id === Number(params.person)) : undefined;
  const target = chosen?.id ?? user.id;
  const company = listDocuments({ userId: null });
  const personal = listDocuments({ userId: target });
  const categories = DOCUMENT_CATEGORIES.filter((category) => company.some((document) => document.category === category));

  return (
    <>
      <PageHeader title="Documents" description="Company policies and private employee documents in one place." />
      {manages ? (
        <Card className="mb-5 p-4">
          <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label htmlFor="person-filter" className="flex-1 text-sm font-medium text-foreground">Browse employee documents
              <select id="person-filter" name="person" defaultValue={chosen?.id ?? ""} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground">
                <option value="">My documents</option>
                {people.filter((person) => person.id !== user.id).map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
              </select>
            </label>
            <button type="submit" className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-foreground/[0.04]">View documents</button>
          </form>
        </Card>
      ) : null}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        <div className="flex flex-col gap-5">
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">Company documents</h2>
            {categories.length ? (
              <div className="flex flex-col gap-4">
                {categories.map((category) => (
                  <Card key={category} className="overflow-hidden">
                    <h3 className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">{category}</h3>
                    <ul className="divide-y divide-border">{company.filter((document) => document.category === category).map((document) => <DocumentRow key={document.id} document={document} user={user} />)}</ul>
                  </Card>
                ))}
              </div>
            ) : <Card className="p-5"><Empty title="No company documents">Company policies and shared files will appear here.</Empty></Card>}
          </section>
          <section>
            <h2 className="mb-3 text-base font-semibold text-foreground">{chosen ? `${chosen.name}’s documents` : "My documents"}</h2>
            <Card className="overflow-hidden">
              {personal.length ? <ul className="divide-y divide-border">{personal.map((document) => <DocumentRow key={document.id} document={document} user={user} />)}</ul> : <div className="p-5"><Empty title="No personal documents">Private documents for {chosen ? chosen.name : "you"} will appear here.</Empty></div>}
            </Card>
          </section>
        </div>
        <DocumentUploadForm
          key={chosen?.id ?? "company"}
          people={people.map(({ id, name }) => ({ id, name }))}
          manages={manages}
          defaultUserId={chosen?.id}
        />
      </div>
    </>
  );
}
