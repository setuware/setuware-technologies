import type { Instrumentation } from "next";

/**
 * Server errors go to the Slack #site-alerts channel (when SLACK_BOT_TOKEN is
 * set), at most once per route and message every 15 minutes.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.SLACK_BOT_TOKEN) return;
  const message = error instanceof Error ? error.message : String(error);
  const digest = typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : "";
  const { slackAlert } = await import("@/lib/slack-events");
  const { esc } = await import("@/lib/slack");
  slackAlert(
    `error:${context.routePath}:${message.slice(0, 120)}`,
    "Server error",
    `\`${esc(request.method)} ${esc(request.path.split("?")[0])}\` failed (${esc(context.routeType)}, \`${esc(context.routePath)}\`).${digest ? ` Digest \`${esc(digest)}\`.` : ""}`,
    message.slice(0, 1500),
  );
};
