import { pageMetadata } from "@/lib/seo";
import { ServicesGrid } from "@/components/sections/services-grid";
import { ProcessDark } from "@/components/sections/process-dark";
import { CtaBand } from "@/components/sections/cta-band";
import { Faq } from "@/components/sections/faq";
import { DeferredSection } from "@/components/ui/deferred-section";
import { PageHero } from "@/components/layout/page-hero";

export const metadata = pageMetadata({
  title: "Services",
  description:
    "Web development, app development, managed hosting, AI integration, product design and ongoing support — delivered and maintained by one accountable team.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Build it, launch it, keep it alive"
        description="Most agencies stop at handover. Our hosting and support work exists so that the team who wrote the code is the team on call when it matters."
      />

      <ServicesGrid heading={false} />

      <DeferredSection minHeight={820}>
        <ProcessDark />
      </DeferredSection>

      <DeferredSection minHeight={720}>
        <Faq />
      </DeferredSection>

      <DeferredSection minHeight={380}>
        <CtaBand />
      </DeferredSection>
    </>
  );
}
