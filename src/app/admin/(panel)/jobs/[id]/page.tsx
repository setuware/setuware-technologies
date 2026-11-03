import { notFound } from "next/navigation";

import { deleteJobAction } from "@/app/admin/actions";
import { jobLocations, jobTeams, jobTypes } from "@/lib/careers";
import { requireUser } from "@/lib/cms/session";
import { getJobRecord, jobLists } from "@/lib/cms/store";
import { ConfirmDelete } from "@/components/admin/confirm-delete";
import { JobEditor } from "@/components/admin/job-editor";
import { formatWhen, PageHeader } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function EditJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireUser("jobs");
  const { id } = await params;
  const { saved } = await searchParams;
  const job = getJobRecord(Number(id));
  if (!job) notFound();
  const lists = jobLists(job);

  return (
    <>
      <PageHeader
        title="Edit job"
        description={`Last saved ${formatWhen(job.updated_at)}${job.updated_by ? ` by ${job.updated_by}` : ""}`}
        back={{ href: "/admin/jobs", label: "All jobs" }}
        actions={<ConfirmDelete action={deleteJobAction} id={job.id} label="Delete job" what={job.title} />}
      />
      {saved ? (
        <p className="mb-5 rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-400">Job created.</p>
      ) : null}
      <JobEditor
        key={job.updated_at}
        teams={jobTeams}
        types={jobTypes}
        locations={jobLocations}
        initial={{
          id: job.id,
          slug: job.slug,
          title: job.title,
          short_title: job.short_title ?? "",
          team: job.team,
          location: job.location,
          type: job.type,
          experience: job.experience,
          summary: job.summary,
          skills: lists.skills.join(", "),
          responsibilities: lists.responsibilities.join("\n"),
          requirements: lists.requirements.join("\n"),
          nice_to_haves: lists.nice_to_haves.join("\n"),
          status: job.status,
          posted_at: job.posted_at,
        }}
      />
    </>
  );
}
