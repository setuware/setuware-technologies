# SEO

How setuware.in is set up for search, and what the owner still needs to do.
Canonical domain: **https://setuware.in** (override with `NEXT_PUBLIC_SITE_URL`).

## What is in place

### Titles, descriptions and social cards

- Every route builds its metadata with `pageMetadata()` in `src/lib/seo.ts`.
  It produces a canonical URL, Open Graph and Twitter tags (`en_IN`, site name,
  image) and the title.
- `fitTitle()` appends the brand and keeps the title at 60 characters or fewer.
  It uses "| Setuware Technologies" when that fits and "| Setuware" when it does
  not. Each title starts with the main keyword. For example, the home title is
  "Website Development Company in Gurugram | Setuware".
- Long content titles have a short `seoTitle` and, where needed, an
  `seoDescription`. These fields exist on services (`content.ts`), case
  studies (`content.ts`) and posts (`posts.ts`). Industries already had both.
  Careers roles use `jobMetaTitle` and `jobMetaDescription` in `careers.ts`.
- Meta descriptions are 120–155 characters and mention the service and the
  location naturally. `tests/unit/seo.test.ts` enforces both limits for all
  content.
- Social card: `app/opengraph-image.tsx` (1200×630) is set explicitly on every
  page. Blog posts and case studies use their cover photo instead. Metadata
  merges are shallow, so a page cannot rely on inheriting the card.
- `/status` and `/not-found` are `noindex, follow`. Unknown slugs return a real
  404 through `src/proxy.ts`.
- Google Search Console: set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` to the
  HTML-tag token to emit `google-site-verification`. Nothing is emitted while
  it is unset.

### Structured data (JSON-LD)

| Where | Types |
| --- | --- |
| Every page (root layout) | One `@graph` with two nodes. `ProfessionalService` (`#organization`, which is both an Organization and a LocalBusiness) carries the logo, NAP, geo, opening hours (Mon–Sat 10:00–19:00), `priceRange` "₹₹", area served (India), contact points, `sameAs` and the founder (Satyam Raj). `WebSite` is the second node. There is no URL-based site search, so it has no `SearchAction`. |
| All inner pages | `BreadcrumbList`, starting at Home |
| `/services/[slug]` | `Service` with an `Offer` and an INR `PriceSpecification` from the starting price. For example, business websites start at ₹5,000 for a landing page. Also `FAQPage`. |
| Home, `/pricing`, `/process`, `/careers` | `FAQPage`, matching the FAQs shown on the page |
| `/blog/[slug]` | `BlogPosting` with headline, dates, cover image and publisher. The author is the person named in the visible byline, linked to the organization with `worksFor`. Google expects the author to match the byline. |
| `/careers/[slug]` | `JobPosting`: title, HTML description, `datePosted`, `validThrough`, employment type, Gurugram address and hiring organization with logo |

- Logo: `app/apple-icon.tsx` renders the brand mark as a 180×180 PNG. It is
  also the iOS home-screen icon and the PNG icon in the manifest.

### Crawling

- `sitemap.xml` (`app/sitemap.ts`) is built from the same data the pages use.
  It covers the static pages, services, industries, case studies, careers roles
  and blog posts, each with `lastModified`, `priority` and `changeFrequency`.
  Pages marked noindex are left out. `tests/unit/sitemap.test.ts` checks it.
- `robots.txt` allows everything except `/api/` and points to the sitemap and
  host.

### Technical

- `<html lang="en-IN">`.
- Every page has exactly one `<h1>`, and headings do not skip levels. The home
  page `<h1>` is "Website & app development company in Gurugram", with the
  brand line as an `<h2>`.
- Images use `next/image` with width and height, or `fill` with `sizes`.
  Images that carry content have descriptive alt text. Purely decorative
  images use `alt=""`.
- Fonts are self-hosted by `next/font`, so no `preconnect` is needed.
- The manifest uses name "Setuware Technologies", short name "Setuware",
  brand theme colour `#00a1c6`, an SVG icon and a PNG icon. `favicon.ico` is
  served.

### Checking it

```bash
npx vitest run tests/unit/seo.test.ts tests/unit/sitemap.test.ts
```

After deploying, check a few URLs with Google's
[Rich Results Test](https://search.google.com/test/rich-results) and the
[Schema Markup Validator](https://validator.schema.org/).

## Owner checklist

1. **Search Console.** Add the domain property for `setuware.in`, using either
   DNS verification or the HTML tag through
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`. Then submit
   `https://setuware.in/sitemap.xml`.
2. **Request indexing** with URL Inspection for the home page, `/services`, the
   ten service pages, `/pricing` and `/contact`.
3. **Google Business Profile.** Create and verify a profile for the Gurugram
   office. Use exactly the same name, address and phone as the site:
   *Setuware Technologies, MG Road, Gurugram, Haryana 122001* and
   *+91 83027 83900*. Set the hours to Mon–Sat 10:00–19:00, the category to
   "Website designer" or "Software company", and the website to
   https://setuware.in. Ask happy clients for reviews.
4. **Social profiles.** The company LinkedIn and GitHub are confirmed and are
   in `site.social`. There are no company X or Instagram profiles yet. When
   they exist, add them to `site.social` in `src/lib/site.ts`. They then appear
   in `sameAs` automatically.
5. **Check the map pin.** The structured data uses approximate MG Road
   coordinates (28.4795, 77.0806) from `site.geo`. Replace them with the exact
   office location from the Business Profile.
6. **Directories and reviews.** List the business on Clutch, GoodFirms,
   DesignRush, JustDial, Sulekha, IndiaMART and LinkedIn, using the same NAP
   everywhere.
7. **Keep publishing.** Post articles regularly in `src/lib/posts.ts`, aimed at
   real client searches such as "website cost in India" or "Shopify vs
   WooCommerce". Link each article to the matching service page.
8. **Monitor.** Check Search Console monthly for coverage errors, Core Web
   Vitals and the queries that bring traffic. Adjust `seoTitle` and
   `seoDescription` on pages with many impressions but a low click-through
   rate.
