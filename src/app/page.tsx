import dynamic from "next/dynamic";

import { faqs } from "@/lib/content";
import { getPublishedPosts } from "@/lib/cms/public";
import { faqJsonLd, HOME_DESCRIPTION, HOME_TITLE, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { HeroSlider } from "@/components/sections/home/hero-slider";
import { PlatformsStrip } from "@/components/sections/home/platforms-strip";
import { ServicesGrid } from "@/components/sections/home/services-grid";
import { AboutCorporate } from "@/components/sections/home/about-corporate";
import { DeferredSection } from "@/components/ui/deferred-section";

/**
 * Home page.
 *
 * Section order: hero slider → platforms strip → services → about → why
 * Setuware → process → projects → plans → contact → articles → FAQ. The
 * footer carries the closing call to action.
 *
 * Load strategy:
 *  - Every section's markup is in the static HTML, so the full page is
 *    indexable, searchable with Ctrl+F and readable without JavaScript.
 *  - Each below-the-fold section is a separate chunk behind `next/dynamic`,
 *    so the client JavaScript its interactive leaves need is fetched on
 *    demand rather than in the first load.
 *  - `DeferredSection` hands off-screen subtrees to the browser's own
 *    `content-visibility` deferral, which skips their layout and paint until
 *    they are approached — the rendering win, without hiding content.
 *
 * The whole route is static: there is no request-time data here, so it is
 * served as a prerendered file from the CDN edge and a traffic spike never
 * reaches the application server.
 */

export const metadata = pageMetadata({
  title: HOME_TITLE,
  exactTitle: true,
  description: HOME_DESCRIPTION,
  path: "/",
});

const WhyChoose = dynamic(() =>
  import("@/components/sections/home/why-choose").then((mod) => mod.WhyChoose),
);
const ProcessSteps = dynamic(() =>
  import("@/components/sections/home/process-steps").then((mod) => mod.ProcessSteps),
);
const SelectedProjects = dynamic(() =>
  import("@/components/sections/selected-projects").then((mod) => mod.SelectedProjects),
);
const FlexiblePlans = dynamic(() =>
  import("@/components/sections/flexible-plans").then((mod) => mod.FlexiblePlans),
);
const ContactBand = dynamic(() =>
  import("@/components/sections/home/contact-band").then((mod) => mod.ContactBand),
);
const Articles = dynamic(() =>
  import("@/components/sections/articles").then((mod) => mod.Articles),
);
const Faq = dynamic(() => import("@/components/sections/faq").then((mod) => mod.Faq));

export default async function HomePage() {
  const latestPosts = (await getPublishedPosts()).slice(0, 3);
  return (
    <>
      <HeroSlider />
      <PlatformsStrip />
      <ServicesGrid />
      <AboutCorporate />

      <DeferredSection minHeight={720}>
        <WhyChoose />
      </DeferredSection>

      <DeferredSection minHeight={720}>
        <ProcessSteps />
      </DeferredSection>

      <DeferredSection minHeight={760}>
        <SelectedProjects />
      </DeferredSection>

      <DeferredSection minHeight={760}>
        <FlexiblePlans />
      </DeferredSection>

      <DeferredSection minHeight={900}>
        <ContactBand />
      </DeferredSection>

      <DeferredSection minHeight={720}>
        <Articles posts={latestPosts} />
      </DeferredSection>

      <DeferredSection minHeight={720}>
        <Faq />
      </DeferredSection>

      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
