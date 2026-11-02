/**
 * Article bodies, keyed by slug.
 *
 * Imported only by the article page (a Server Component), so none of this text
 * reaches the client bundle. Blocks rather than HTML or MDX: the renderer is a
 * pure function of data, there is no markdown runtime to ship, and no post can
 * inject markup.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: readonly string[] }
  | { type: "ol"; items: readonly string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "code"; language: string; code: string }
  | { type: "callout"; tone: "info" | "warn"; text: string };

export const postBodies: Record<string, readonly Block[]> = {
  "surviving-a-traffic-spike": [
        {
          type: "p",
          text: "Every founder asks the same question before launch: will it hold? The honest answer is that it depends almost entirely on how many requests reach your application server at all. A thousand simultaneous visitors is a trivial load for a CDN and a brutal one for an unindexed database query.",
        },
        { type: "h2", text: "Push as much as possible to build time" },
        {
          type: "p",
          text: "A page rendered at build time is a file. Serving a file to a thousand people costs nothing interesting — the CDN answers from the edge and your server never wakes up. The work is identifying which pages genuinely need request-time data, and being ruthless about the rest.",
        },
        {
          type: "ul",
          items: [
            "Marketing pages, docs and case studies: static, revalidated on a schedule",
            "Listings that change hourly: static with incremental revalidation",
            "Personalised or authenticated views: dynamic, but streamed around a static shell",
            "Anything with a price or a count: cache the query, not the page",
          ],
        },
        { type: "h2", text: "Then find the one slow thing" },
        {
          type: "p",
          text: "Under load, systems fail at their narrowest point, and it is almost never the one you expected. In our experience the culprit is usually one of four things.",
        },
        {
          type: "ol",
          items: [
            "A query without an index that was fast on 500 rows and fatal on 500,000",
            "A third-party API call in the render path with no timeout",
            "A connection pool sized for development, exhausted in seconds",
            "An image served at full resolution to a mobile viewport",
          ],
        },
        {
          type: "callout",
          tone: "info",
          text: "Set a timeout on every outbound call. An upstream that hangs for 30 seconds turns a slow dependency into a full outage, because your workers are all waiting on it.",
        },
        { type: "h2", text: "Load test before you need the answer" },
        {
          type: "p",
          text: "A load test is not a pass/fail exam, it is how you learn the shape of your ceiling. Run it against production-sized data, ramp gradually, and watch error rate and p95 latency rather than averages — averages hide exactly the failures users notice.",
        },
        {
          type: "code",
          language: "bash",
          code: "# Ramp to 1,000 concurrent connections and report p99\nnpm run loadtest -- --connections 1000 --duration 60",
        },
        {
          type: "p",
          text: "When the ceiling is four times your worst forecast day, you can stop. When it is 1.2 times, you have work to do, and now you know where.",
        },
        {
          type: "quote",
          text: "Capacity you have not measured is a guess you are planning to find out about during a launch.",
        },
      ],
  "fixed-price-software-honestly": [
        {
          type: "p",
          text: "Clients want a number before they commit. Agencies want protection against a scope that keeps growing. These goals are compatible, but aligning them requires writing down what is out of scope, which is the part most proposals skip.",
        },
        { type: "h2", text: "Price the phase, not the product" },
        {
          type: "p",
          text: "We quote discovery separately and cheaply. By the end of it we know the data model, the integrations and the risky unknowns, which is exactly the information that makes the build quote accurate instead of defensive.",
        },
        { type: "h2", text: "Write the exclusions down" },
        {
          type: "ul",
          items: [
            "Which integrations are in phase one, and which are explicitly later",
            "How many rounds of design revision the price covers",
            "Who supplies content, and what happens to the timeline if it is late",
            "What we will do if a third-party API turns out to be undocumented",
          ],
        },
        {
          type: "callout",
          tone: "warn",
          text: "If a proposal has no exclusions section, the exclusions still exist. You just have not been told what they are yet.",
        },
        { type: "h2", text: "Make change requests boring" },
        {
          type: "p",
          text: "Mid-build requests are normal and usually good — they mean the client is engaged. We quote them as small, separate line items within two working days. Nobody has to have an uncomfortable conversation about whether something was 'implied'.",
        },
        {
          type: "p",
          text: "The result is a number we can stand behind without a risk premium, because the risk is described rather than priced in.",
        },
      ],
  "choosing-managed-hosting": [
        {
          type: "p",
          text: "Hosting is the easiest line item to under-buy, because the cheap version looks identical right up until something goes wrong. What you are buying with a managed plan is not CPU. It is the answer to a specific list of questions.",
        },
        { type: "h2", text: "The questions that matter" },
        {
          type: "ol",
          items: [
            "When the site goes down, who finds out first — you, or a monitor?",
            "When did someone last restore a backup to prove it works?",
            "What happens to traffic when one instance becomes unhealthy?",
            "Who renews the TLS certificate, and what if they are on leave?",
            "Where do the logs live after the container is replaced?",
          ],
        },
        {
          type: "p",
          text: "A backup you have never restored is not a backup, it is a file. Testing restores monthly is unglamorous work, and it is the single highest-value habit in infrastructure.",
        },
        { type: "h2", text: "What good looks like" },
        {
          type: "ul",
          items: [
            "Health checks that remove a bad instance without a human",
            "Nightly backups with a monthly restore rehearsal",
            "A WAF and rate limits in front of public endpoints",
            "Alerts routed to the on-call engineer",
            "An incident report written afterwards, not a verbal apology",
          ],
        },
        {
          type: "quote",
          text: "The purpose of managed hosting is that an outage becomes our problem before it becomes your customers' problem.",
        },
      ],
  "animation-without-wrecking-performance": [
        {
          type: "p",
          text: "The animated hero that convinced your stakeholders can easily be the reason your Largest Contentful Paint is three seconds on a real phone. The fix is not fewer animations — it is being deliberate about what runs on the main thread and what loads before first paint.",
        },
        { type: "h2", text: "Animate compositor properties only" },
        {
          type: "p",
          text: "Transform and opacity can be handed to the GPU. Width, height, top and box-shadow cannot, and animating them forces layout on every frame. This single rule removes most jank.",
        },
        {
          type: "code",
          language: "css",
          code: "/* Cheap: composited */\n.card { transition: transform 240ms ease, opacity 240ms ease; }\n\n/* Expensive: triggers layout each frame */\n.card--bad { transition: width 240ms ease, box-shadow 240ms ease; }",
        },
        { type: "h2", text: "Load motion code only when it is needed" },
        {
          type: "p",
          text: "An animation library in the initial bundle delays interactivity for every visitor, including the ones who bounce from the hero. Lazy-load anything below the fold and let the first screen render from HTML and CSS alone.",
        },
        { type: "h2", text: "Video is not a background decoration" },
        {
          type: "ul",
          items: [
            "Always ship a poster image so the first frame costs nothing",
            "Use preload='none' and start playback only when the element is in view",
            "Keep it muted, looping and short — under 10 seconds, under 2MB",
            "Pause it when the tab is hidden; nobody benefits from background decoding",
          ],
        },
        {
          type: "callout",
          tone: "info",
          text: "Honour prefers-reduced-motion. For some people the parallax hero is not delightful, it is physically unpleasant — and the fallback is usually nicer than the animation anyway.",
        },
        {
          type: "p",
          text: "Our working budget for a marketing page: under 120KB of JavaScript before interaction, LCP under 1.5 seconds on a throttled 4G connection, and no layout shift after first paint. Everything decorative earns its place against that budget.",
        },
      ],
};

export function getPostBody(slug: string): readonly Block[] {
  return postBodies[slug] ?? [];
}
