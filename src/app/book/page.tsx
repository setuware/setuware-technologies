import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { BookingWidget } from "@/components/interactive/booking-widget";
import { PageHero } from "@/components/layout/page-hero";
import { Section } from "@/components/ui/section";

export const metadata = pageMetadata({
  title: "Book a Free Consultation",
  description:
    "Pick a 30-minute slot to talk through your website, app or software project with our team. Video or phone call, free and without obligation.",
  path: "/book",
});

const COVERED = [
  ["Your goals", "What you want to build, for whom, and by when."],
  ["Our recommendation", "The simplest approach, what to launch with and what can wait."],
  ["Next steps", "A written scope and fixed price within a few working days."],
] as const;

export default function BookPage() {
  return (
    <>
      <PageHero
        eyebrow="Free consultation"
        title="Book a call with our team"
        description="Pick a 30-minute slot that suits you. Video or phone, whichever you prefer."
      />

      <Section className="pb-20 pt-4 md:pb-28 md:pt-6">
        <div className="container-page">
          <BookingWidget />

          <ol className="mt-12 grid gap-6 border-t border-border pt-8 sm:grid-cols-3">
            {COVERED.map(([title, body], index) => (
              <li key={title} className="flex gap-4">
                <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Book a consultation", path: "/book" }])} />
    </>
  );
}
