import { pageMetadata } from "@/lib/seo";
import { ProcessDark } from "@/components/sections/process-dark";
import { Faq } from "@/components/sections/faq";
import { ChallengeCta } from "@/components/sections/challenge-cta";
import { PageHero } from "@/components/layout/page-hero";
import { DeferredSection } from "@/components/ui/deferred-section";

export const metadata = pageMetadata({
  title: "How it works",
  description:
    "Our delivery process, stage by stage: discovery, scope, design, development, testing and launch, and ongoing support — with what you get and how long each takes.",
  path: "/process",
});

export default function ProcessPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="No black box between kickoff and launch"
        description="Six stages, each with a written deliverable and a published duration. You will always know what is being built this fortnight, what it costs, and what is coming next."
      />

      <ProcessDark />

      <DeferredSection minHeight={720}>
        <Faq />
      </DeferredSection>

      <DeferredSection minHeight={360}>
        <ChallengeCta />
      </DeferredSection>
    </>
  );
}
