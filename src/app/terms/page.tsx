import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { LegalPage, type LegalSection } from "@/components/layout/legal-page";

export const metadata = pageMetadata({
  title: "Terms of service",
  description: `The terms that apply to this website and to engagements with ${site.name}.`,
  path: "/terms",
});

const SECTIONS: LegalSection[] = [
  {
    heading: "About these terms",
    paragraphs: [
      `These terms cover your use of this website. Client engagements are governed by the signed proposal and master services agreement for that project, which takes precedence over anything here if the two conflict.`,
    ],
  },
  {
    heading: "Quotes and estimates",
    paragraphs: [
      "The instant estimator produces an indicative range generated from our published rate card. It is not a contractual offer. A binding price is only the one in a written proposal signed by both parties after discovery.",
      "Prices shown exclude GST and exclude third-party costs such as cloud hosting, payment gateway fees and software licences, which are billed to your own accounts at cost.",
    ],
  },
  {
    heading: "Intellectual property",
    paragraphs: [
      "On full payment, you own the source code, designs and documentation we produce for your project. We retain ownership of our pre-existing libraries and tooling, licensed to you perpetually and royalty-free for use within your project.",
      "This website's own content, branding and copy remain our property.",
    ],
  },
  {
    heading: "Service levels",
    paragraphs: [
      "Uptime and response commitments apply only to clients on an active hosting or support plan, as set out in that plan. Published figures on this site describe our targets and are not a warranty to visitors generally.",
    ],
  },
  {
    heading: "Acceptable use",
    paragraphs: [
      "Do not attempt to disrupt this site, bypass its rate limits, or submit material that is unlawful or infringing. Automated scraping of this site at a rate that degrades it for others is not permitted.",
    ],
  },
  {
    heading: "Liability",
    paragraphs: [
      "This website is provided as-is. To the extent permitted by law, we are not liable for indirect or consequential loss arising from use of the site or reliance on estimates produced by it. Liability under a client engagement is set out in that engagement's agreement.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: [
      `These terms are governed by the laws of India, and the courts at ${site.address.city}, ${site.address.region} have exclusive jurisdiction.`,
    ],
  },
  {
    heading: "Contact",
    paragraphs: [`Questions about these terms: ${site.generalEmail}.`],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      updated="2026-10-01"
      intro="These terms cover the website. If we are working together, your signed proposal governs the engagement."
      sections={SECTIONS}
    />
  );
}
