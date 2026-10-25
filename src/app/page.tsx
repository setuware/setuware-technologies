import dynamic from "next/dynamic";

import { faqs } from "@/lib/content";
import { faqJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Hero } from "@/components/sections/hero";
import { CapabilityTicker } from "@/components/sections/capability-ticker";
import { AboutPreview } from "@/components/sections/about-preview";
import { ServicesDark } from "@/components/sections/services-dark";
import { DeferredSection } from "@/components/ui/deferred-section";

/**
 * Home page.
 *
 * Section order follows the approved design: hero → capability ticker →
 * about → services → process → industry → projects → tools → plans → CTA →
 * skills gap → testimonials → articles → FAQ.
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

const ProcessDark = dynamic(() =>
  import("@/components/sections/process-dark").then((mod) => mod.ProcessDark),
);
const IndustryBento = dynamic(() =>
  import("@/components/sections/industry-bento").then((mod) => mod.IndustryBento),
);
const SelectedProjects = dynamic(() =>
  import("@/components/sections/selected-projects").then((mod) => mod.SelectedProjects),
);
const ToolsRow = dynamic(() =>
  import("@/components/sections/tools-row").then((mod) => mod.ToolsRow),
);
const FlexiblePlans = dynamic(() =>
  import("@/components/sections/flexible-plans").then((mod) => mod.FlexiblePlans),
);
const ChallengeCta = dynamic(() =>
  import("@/components/sections/challenge-cta").then((mod) => mod.ChallengeCta),
);
const SkillsGap = dynamic(() =>
  import("@/components/sections/skills-gap").then((mod) => mod.SkillsGap),
);
const Testimonials = dynamic(() =>
  import("@/components/sections/testimonials").then((mod) => mod.Testimonials),
);
const Articles = dynamic(() =>
  import("@/components/sections/articles").then((mod) => mod.Articles),
);
const Faq = dynamic(() => import("@/components/sections/faq").then((mod) => mod.Faq));

export default function HomePage() {
  return (
    <>
      <Hero />
      <CapabilityTicker />
      <AboutPreview />
      <ServicesDark />

      <DeferredSection minHeight={820}>
        <ProcessDark />
      </DeferredSection>

      <DeferredSection minHeight={760}>
        <IndustryBento />
      </DeferredSection>

      <DeferredSection minHeight={760}>
        <SelectedProjects />
      </DeferredSection>

      <DeferredSection minHeight={200}>
        <ToolsRow />
      </DeferredSection>

      <DeferredSection minHeight={760}>
        <FlexiblePlans />
      </DeferredSection>

      <DeferredSection minHeight={360}>
        <ChallengeCta />
      </DeferredSection>

      <DeferredSection minHeight={520}>
        <SkillsGap />
      </DeferredSection>

      <DeferredSection minHeight={720}>
        <Testimonials />
      </DeferredSection>

      <DeferredSection minHeight={720}>
        <Articles />
      </DeferredSection>

      <DeferredSection minHeight={720}>
        <Faq />
      </DeferredSection>

      <JsonLd data={faqJsonLd(faqs)} />
    </>
  );
}
