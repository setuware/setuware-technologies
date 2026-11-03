import { jobLocations, jobTeams, jobTypes } from "@/lib/careers";
import { requireUser } from "@/lib/cms/session";
import { JobEditor } from "@/components/admin/job-editor";
import { PageHeader } from "@/components/admin/ui";

// Signed-in page: rendered per request (see the panel layout).
export const instant = false;

export default async function NewJobPage() {
  await requireUser("jobs");
  return (
    <>
      <PageHeader title="New job" back={{ href: "/admin/jobs", label: "All jobs" }} />
      <JobEditor
        teams={jobTeams}
        types={jobTypes}
        locations={jobLocations}
        initial={{
          slug: "",
          title: "",
          short_title: "",
          team: jobTeams[0],
          location: jobLocations[0],
          type: "Full-time",
          experience: "",
          summary: "",
          skills: "",
          responsibilities: "",
          requirements: "",
          nice_to_haves: "",
          status: "open",
          posted_at: new Date().toISOString().slice(0, 10),
        }}
      />
    </>
  );
}
