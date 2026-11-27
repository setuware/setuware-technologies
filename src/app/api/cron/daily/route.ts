import { notify } from "@/lib/cms/notify";
import { runReminders } from "@/lib/cms/reminders";
import { cronAuthorized } from "@/lib/cron-auth";
import { slackDigest, slackScheduledPosts } from "@/lib/slack-events";
import { syncSlackMembers } from "@/lib/slack-onboarding";

/**
 * Reminders and clean-up (stale timers, check-in / check-out nudges, overdue
 * tasks, timesheets, approvals, birthdays), the morning Slack summary, and
 * adding new Slack members to their channels.
 * Run every 15 minutes:
 *
 *   *\/15 * * * * curl -fsS "http://127.0.0.1:3000/api/cron/daily?key=$CRON_SECRET" >/dev/null
 *
 * Each reminder goes out at most once, so running it often is safe.
 */
export async function GET(request: Request) {
  if (!cronAuthorized(request)) return new Response("Not found", { status: 404 });
  const sent = runReminders(notify);
  slackScheduledPosts();
  const digest = await slackDigest();
  const slackMembers = await syncSlackMembers();
  return Response.json({ ok: true, sent, digest, slackMembers });
}
