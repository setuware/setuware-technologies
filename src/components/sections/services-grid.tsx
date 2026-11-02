import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { services } from "@/lib/content";
import { Card, CardBody, CardText, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { ServiceIcon } from "@/components/ui/service-icon";

export function ServicesGrid({
  heading = true,
}: {
  heading?: boolean;
}) {
  return (
    <Section id="services">
      <div className="container-page">
        {heading ? (
          <SectionHeading
            eyebrow="Our services"
            title="End-to-end digital services"
            description="From your first website to enterprise-grade software, delivered by one accountable team."
          />
        ) : null}

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.slug} delay={index * 70} as="div">
              <Card interactive as="article" className="h-full">
                <CardBody className="flex h-full flex-col gap-4">
                  <ServiceIcon name={service.icon} accent={service.accent} />

                  <div>
                    <CardTitle>{service.name}</CardTitle>
                    <CardText className="mt-2">{service.summary}</CardText>
                  </div>

                  <ul className="flex flex-col gap-1.5">
                    {service.outcomes.slice(0, 2).map((outcome) => (
                      <li
                        key={outcome}
                        className="flex gap-2 text-[0.85rem] leading-snug text-muted-foreground"
                      >
                        <span
                          className="mt-1.5 size-1 shrink-0 rounded-full bg-primary"
                          aria-hidden
                        />
                        {outcome}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                  >
                    Learn more
                    <ArrowRight
                      className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden
                    />
                  </Link>
                </CardBody>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}
