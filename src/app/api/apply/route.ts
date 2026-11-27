import { applicantConfirmationEmail, hrApplicationEmail } from "@/lib/application-emails";
import { clientKey, fail, looksLikeSpam, ok, rateLimitHeaders } from "@/lib/api";
import { emailConfigured, getTransporter } from "@/lib/lead-email";
import { contactLimiter } from "@/lib/rate-limit";
import { site } from "@/lib/site";
import { applicationSchema, fieldErrors } from "@/lib/validation";
import { createApplication, openJobBySlug } from "@/lib/cms/store";
import { saveUpload, UploadError } from "@/lib/cms/uploads";

/**
 * Job applications (multipart: fields + a CV). The CV is checked by its
 * contents, stored privately, recorded in the admin, and e-mailed to HR.
 */
export async function POST(request: Request) {
  const limit = contactLimiter.consume(clientKey(request, "apply"));
  const headers = rateLimitHeaders(limit);
  if (!limit.ok) {
    return fail("rate_limited", `Too many applications from this connection. Try again in ${limit.retryAfter}s.`, { headers });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("bad_request", "The application could not be read. Please try again.");
  }

  const parsed = applicationSchema.safeParse(Object.fromEntries([...form.entries()].filter(([, value]) => typeof value === "string")));
  if (!parsed.success) {
    return fail("validation_failed", "Please check the highlighted fields.", { fields: fieldErrors(parsed.error) });
  }
  if (looksLikeSpam(parsed.data)) return ok({ received: true }, { status: 201, message: "Application received." });

  const job = openJobBySlug(parsed.data.job);
  if (!job) return fail("validation_failed", "This role is no longer open.", { fields: { job: "This role is no longer open." } });

  const resume = form.get("resume");
  if (!(resume instanceof File) || resume.size === 0) {
    return fail("validation_failed", "Please attach your CV.", { fields: { resume: "Please attach your CV (PDF or Word)." } });
  }

  let stored: Awaited<ReturnType<typeof saveUpload>>;
  try {
    stored = await saveUpload("resumes", resume);
  } catch (error) {
    const message = error instanceof UploadError ? error.message : "The CV could not be saved.";
    return fail("validation_failed", message, { fields: { resume: message } });
  }

  const { name, email, phone, links = "", note = "" } = parsed.data;
  createApplication({
    job_slug: job.slug,
    job_title: job.title,
    name,
    email,
    phone,
    links,
    note,
    resume_file: stored.file,
    resume_name: stored.original,
  });
  console.info("[apply]", job.slug, stored.file);

  if (emailConfigured()) {
    const bytes = Buffer.from(await resume.arrayBuffer());
    const details = { name, email, phone, links, note, jobTitle: job.title, jobSlug: job.slug };
    const from = process.env.LEAD_EMAIL_FROM ?? `${site.name} <${process.env.SMTP_USER}>`;
    const hr = process.env.HR_EMAIL_TO ?? site.hrEmail;
    getTransporter()
      .sendMail({
        from,
        to: hr,
        replyTo: email,
        ...hrApplicationEmail(details),
        attachments: [{ filename: stored.original, content: bytes, contentType: stored.mime }],
      })
      .catch((error: unknown) => console.error("[apply] hr email failed", error instanceof Error ? error.message : error));
    getTransporter()
      .sendMail({ from, to: email, replyTo: hr, ...applicantConfirmationEmail(details) })
      .catch((error: unknown) => console.error("[apply] applicant email failed", error instanceof Error ? error.message : error));
  }

  return ok(
    { received: true },
    { status: 201, message: `Thank you, ${name.split(" ")[0]}. Your application for ${job.title} has been received.`, headers },
  );
}

export async function GET() {
  return fail("bad_request", "This endpoint only accepts POST.");
}
