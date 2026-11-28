import { caseStudies, faqs, processSteps, services, techStack } from "./content";
import { industries } from "./industries";
import { APP_BUILD_FROM, carePlans, projectPackages } from "./plans";
import { site } from "./site";
import { founder } from "./team";
import { formatINR } from "./utils";

let cachedKnowledge: string | undefined;

export function assistantKnowledge(): string {
  if (cachedKnowledge) return cachedKnowledge;

  const serviceContent = services
    .map((service) => {
      const applicationBuild =
        service.slug === "web-development" || service.slug === "custom-software"
          ? `Full Application Build package from ${formatINR(APP_BUILD_FROM)}`
          : undefined;

      return [
        `Name: ${service.name}`,
        `Summary: ${service.summary}`,
        `Price: ${service.priceLabel ?? `from ${formatINR(service.entryPriceFrom ?? service.priceFrom)}`}`,
        ...(applicationBuild ? [applicationBuild] : []),
        `Typical timeline: ${service.typicalTimeline}`,
        `Stack: ${service.stack.join(", ")}`,
        `Deliverables: ${service.deliverables.join("; ")}`,
        ...(service.faqs ?? []).flatMap((faq) => [`Q: ${faq.question}`, `A: ${faq.answer}`]),
      ].join("\n");
    })
    .join("\n\n");

  const packageContent = [...projectPackages, ...carePlans]
    .map((plan) =>
      [
        `Name: ${plan.name}`,
        ...(plan.setupFrom !== undefined ? [`Setup from: ${formatINR(plan.setupFrom)}`] : []),
        ...(plan.monthly !== null ? [`Monthly: ${formatINR(plan.monthly)}`] : []),
        `Best for: ${plan.bestFor}`,
        `Features: ${plan.features.join("; ")}`,
      ].join("\n"),
    )
    .join("\n\n");

  cachedKnowledge = [
    [
      "COMPANY",
      `Name: ${site.name}`,
      `Slogan: ${site.slogan}`,
      `Address: ${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}`,
      `Phone: ${site.phone}`,
      `Sales email: ${site.salesEmail}`,
      `Support email: ${site.supportEmail}`,
      `Hours: ${site.hours}`,
      `Founded: ${site.founded}`,
      `SLA: Uptime ${site.sla.uptime}; first response ${site.sla.firstResponse}; support ${site.sla.support}`,
      `Founder: ${founder.name}, ${founder.role}. ${founder.bio}`,
    ].join("\n"),
    `SERVICES\n${serviceContent}`,
    `PACKAGES\n${packageContent}`,
    `PROCESS\n${processSteps
      .map(
        (step) =>
          `${step.title} (${step.duration}): ${step.description}`,
      )
      .join("\n")}`,
    `FAQS\n${faqs.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n")}`,
    `INDUSTRIES\n${industries.map((industry) => `${industry.name}: ${industry.summary}`).join("\n")}`,
    `CASE STUDIES\n${caseStudies
      .map((study) =>
        [
          `Client: ${study.client}`,
          `Sector: ${study.sector}`,
          `Title: ${study.title}`,
          `Summary: ${study.summary}`,
          `Year: ${study.year}`,
          `Results: ${study.results.map((result) => `${result.label}: ${result.value}`).join("; ")}`,
        ].join("\n"),
      )
      .join("\n\n")}`,
    `TECH STACK\n${techStack.map((technology) => `${technology.name} (${technology.category})`).join(", ")}`,
  ].join("\n\n");

  return cachedKnowledge;
}
