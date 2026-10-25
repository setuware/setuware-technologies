# Setuware Technologies

Marketing and lead-generation site for Setuware Technologies — a software
agency that builds web and mobile products and then runs them.

Built with Next.js 16 (App Router, Cache Components), React 19, TypeScript and
Tailwind CSS v4.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Production:

```bash
npm run build
npm run start            # single process
npm run start:cluster    # one worker per CPU core (see Scaling)
```

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the build, single process |
| `npm run start:cluster` | Serve the build across all CPU cores |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Unit and component tests (Vitest) |
| `npm run test:coverage` | Tests with coverage thresholds enforced |
| `npm run test:e2e` | End-to-end tests (Playwright, desktop + mobile) |
| `npm run test:all` | typecheck → lint → unit → build → e2e |
| `npm run loadtest` | Load test against a running server |
| `npm run images:placeholders` | Regenerate the placeholder images |

---

## Replacing the placeholder images

The design uses photography. The repository ships generated SVG placeholders at
the exact paths and dimensions the layout expects, so nothing is broken or
mis-sized — but **they are placeholders and should be replaced before launch**.

Drop a real photo at the same path in `public/images/`, keeping the filename:

| File | Used for | Suggested size |
| --- | --- | --- |
| `hero-team.svg` | Hero background | 1920 × 1080 |
| `about-office.svg` | About section | 1080 × 1200 |
| `service-web.svg` | Web service card | 1200 × 800 |
| `service-cloud.svg` | Cloud service card | 900 × 700 |
| `case-tera.svg` | Industry case-study tile | 1000 × 800 |
| `project-medicare.svg` | Selected project | 900 × 1000 |
| `skills-gap.svg` | Skills-gap band | 1400 × 900 |
| `article-automation.svg` | Lead article | 1200 × 800 |
| `article-processes.svg` | Article card | 900 × 700 |
| `article-growth.svg` | Article card | 900 × 700 |

JPEG or WebP at roughly 2× the listed size is ideal; Next's image pipeline
handles AVIF/WebP conversion and responsive sizing. Dimensions are declared in
`src/lib/images.ts`, so update them there if your crop differs — that is what
prevents layout shift.

### Hero video

The hero runs a photograph by default. To use video instead, drop the files in
`public/media/` and set:

```bash
NEXT_PUBLIC_HERO_BG_WEBM=/media/tech-loop.webm
NEXT_PUBLIC_HERO_BG_MP4=/media/tech-loop.mp4
NEXT_PUBLIC_HERO_BG_POSTER=/media/tech-loop.jpg
```

The player takes over automatically. It fetches nothing until the element is in
view, pauses when the tab is hidden, falls back to the still on any error, and
shows the poster instead of moving video for visitors who prefer reduced
motion. Keep the loop under ten seconds and under 2MB.

`NEXT_PUBLIC_HERO_VIDEO_*` does the same for the inset player used on the About
page and the skills-gap band.

---

## Environment variables

All optional — the site runs without any of them.

| Variable | Effect |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata and sitemap |
| `LEAD_WEBHOOK_URL` | Enquiries are POSTed here (Slack, CRM, email relay). Without it they are written to the server log |
| `NEXT_PUBLIC_HERO_BG_*` | Hero background video (above) |
| `NEXT_PUBLIC_HERO_VIDEO_*` | Inset video player |
| `WEB_CONCURRENCY` | Worker count for `start:cluster` (default: CPU cores) |

---

## Architecture

```
src/
  app/              Routes. Every marketing page is static.
  components/
    sections/       Page sections, server components
    interactive/    Client components (estimator, forms, media, animations)
    layout/         Header, footer, theme, command palette
    ui/             Primitives (button, card, field, accordion…)
  lib/              Domain logic and content — no React
  proxy.ts          Edge checks that run before rendering
tests/
  unit/             Vitest + Testing Library
  e2e/              Playwright (desktop + mobile)
scripts/            Load test, clustered server, placeholder generator
```

**Content lives in `src/lib/`** as typed data (`content.ts`, `posts.ts`,
`plans.ts`, `capabilities.ts`), not a CMS. Every page therefore prerenders at
build time. Swapping in a CMS later means making the readers in those modules
async — the pages do not change.

**Article bodies are in `post-bodies.ts`, separate from post metadata.** The
command palette and the header read post metadata on the client; bundling
every article's prose alongside it pushed first-load JavaScript over budget.

---

## Performance

Enforced as tests in `tests/e2e/performance.spec.ts`, so a regression fails CI
rather than shipping:

- **≤ 185KB** of JavaScript on first load, compressed
- **LCP under 2.5s**
- **CLS under 0.1**
- Marketing pages served as prerendered static HTML

How that is achieved:

- Every marketing route is static — no request-time data anywhere
- Below-the-fold sections are separate chunks via `next/dynamic`
- Off-screen sections use `content-visibility: auto`, so the browser skips
  their layout and paint while keeping the markup in the HTML (crawlable,
  Ctrl+F-able, no pop-in)
- The command palette downloads on first ⌘K, not on page load
- Motion is CSS and IntersectionObserver rather than an animation library
- Media loads nothing until in view and pauses when the tab is hidden

---

## Scaling

Measured locally on 8 cores, load generator on the same machine:

| Setup | Throughput | 1,000 concurrent connections |
| --- | --- | --- |
| `npm run start` (1 process) | ~440 req/s | **15.6% of requests dropped** |
| `npm run start:cluster` (8 workers) | ~700 req/s | **0 dropped, 0 non-2xx** |

A single page is served in ~4ms and weighs 37.6KB gzipped.

Two things carry a traffic spike:

1. **A CDN.** Every marketing page is a prerendered file. With edge caching
   configured, the overwhelming majority of traffic never reaches Node at all.
   This is the part that actually makes 1,000+ concurrent users a non-event.
2. **More than one process.** `start:cluster` forks one worker per core on a
   single machine; in a container platform, run replicas instead.

Run it yourself:

```bash
npm run build && npm run start:cluster &
npm run loadtest -- --connections 1000 --duration 30
npm run loadtest -- --all
```

Local numbers understate capacity — the load generator competes with the
server for the same cores. Measure from a separate machine for absolute
figures.

---

## Security and abuse handling

- Form endpoints are rate-limited per client (`src/lib/rate-limit.ts`), with
  bounded memory so a flood of spoofed IPs cannot grow the map without limit
- Request bodies are size-capped and schema-validated before anything else
  touches them; the quote price is recomputed server-side rather than trusted
- Submissions are forwarded, never stored and read back — there is no endpoint
  that returns enquiries, and emails are masked in logs
- Honeypot field plus a submit-timing check filter automated submissions
- CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy` and
  `Permissions-Policy` are set in `next.config.ts`
- `src/proxy.ts` returns a real 404 for unknown content slugs. Under Cache
  Components a dynamic route serves a prerendered shell before the page body
  resolves, so `notFound()` alone would answer 200 — a soft 404 that search
  engines index

---

## Testing

```bash
npm test              # 223 unit and component tests
npm run test:e2e      # 83 end-to-end tests, desktop + mobile
npm run test:all      # everything, in CI order
```

The e2e suite covers navigation, forms and their failure modes, the estimator,
the API contract, performance budgets, and a full **WCAG 2.1 A/AA audit of
every page** via axe.

Coverage thresholds are enforced per-module in `vitest.config.mts` — the domain
layer (`pricing.ts`, `rate-limit.ts`, `api.ts`) is held to 90–95%+ because that
is where correctness actually lives.

---

## Known limitations

- **Photography is placeholder.** See *Replacing the placeholder images*.
- **Content is hard-coded.** Fine for a marketing site that redeploys on
  change; add a CMS when non-developers need to publish.
- **Rate limiting is per-process.** Correct behind a single instance. Behind
  several, each limits independently — move to a shared store before relying
  on it as abuse protection rather than throttling.
- **Lead delivery is best-effort.** Without `LEAD_WEBHOOK_URL`, enquiries go to
  the server log only. Wire up the webhook before launch.
