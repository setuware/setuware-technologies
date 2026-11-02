import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
import { LegalPage, type LegalSection } from "@/components/layout/legal-page";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: `How ${site.name} collects, uses and protects the personal data you share through this website.`,
  path: "/privacy",
});

const SECTIONS: LegalSection[] = [
  {
    heading: "What we collect",
    paragraphs: [
      "Through this website we collect only what you choose to send us: your name, email address, phone number, company name and the contents of the message or quote request you submit.",
      "Our servers also log standard request data — IP address, user agent and timestamp — which we use to rate-limit abuse and diagnose errors. These logs are retained for 30 days.",
    ],
    bullets: [
      "Contact and quote forms: the details you type into them",
      "Newsletter: your email address and where you subscribed from",
      "Server logs: IP address, user agent, requested path, timestamp",
      "Your browser's local storage: your theme choice and unsent form drafts, which stay on your device and are never sent to us",
    ],
  },
  {
    heading: "Why we collect it",
    paragraphs: [
      "To reply to your enquiry, prepare a quote, and — if you asked for it — send you our monthly email. We do not sell your data, and we do not share it with advertisers or data brokers.",
    ],
  },
  {
    heading: "Who else can see it",
    paragraphs: [
      "Enquiries are delivered to our internal tooling and the email provider we use to reply to you. Those processors act on our instructions only. We do not transfer your data to any third party for their own purposes.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "Enquiries are kept for 24 months so we have context if you come back to us. Newsletter subscriptions are kept until you unsubscribe. Server logs are deleted after 30 days.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      `You can ask us for a copy of what we hold about you, ask us to correct it, or ask us to delete it. Email ${site.generalEmail} and we will action it within 30 days.`,
      "Every newsletter email has a one-click unsubscribe link, and we honour it immediately.",
    ],
  },
  {
    heading: "Cookies and tracking",
    paragraphs: [
      "This site sets no advertising or cross-site tracking cookies. Your theme preference and any unsent form draft are stored in your browser's local storage and never leave your device.",
    ],
  },
  {
    heading: "Security",
    paragraphs: [
      "Traffic is encrypted in transit. Public form endpoints are rate-limited and validated server-side, and submitted enquiries are never exposed through any public endpoint.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: [
      `Questions about this policy, or about data we hold: ${site.generalEmail}. Postal address: ${site.address.street}, ${site.address.city}, ${site.address.region} ${site.address.postalCode}, India.`,
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      updated="2026-10-01"
      intro="This policy explains how we collect, use and protect the personal information you share with us. We retain data only as long as necessary and never sell it."
      sections={SECTIONS}
    />
  );
}
