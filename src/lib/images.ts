/**
 * Image slots used by the design.
 *
 * Every entry names a file under `public/images/`. The site ships generated
 * SVG placeholders at those exact paths so the layout is complete and correct
 * today; replacing a placeholder is a matter of dropping a real photo in with
 * the same filename — no code change, no re-export, no layout shift, because
 * the intrinsic dimensions are declared here rather than read from the file.
 *
 * Supply JPEG or WebP at roughly 2× the listed size. Next's image pipeline
 * handles AVIF/WebP conversion, responsive sizing and lazy loading from there.
 */

import manifest from "./media-manifest.json";

/**
 * Photos downloaded by `npm run media:fetch` (free Pexels licence) are
 * recorded in media-manifest.json under `images`; a slot uses its photo when
 * one is there and its placeholder otherwise.
 */
const photos = ((manifest as { images?: Record<string, string> }).images ?? {}) as Record<
  string,
  string | undefined
>;
const photo = (key: string, fallback: string): string => photos[key] ?? fallback;

export interface ImageSlot {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export const images = {
  heroBackdrop: {
    src: photo("heroBackdrop", "/images/hero-team.svg"),
    width: 1920,
    height: 1080,
    alt: "A business website shown on a laptop browser and a phone",
  },
  aboutOffice: {
    src: photo("aboutOffice", "/images/about-office.svg"),
    width: 1080,
    height: 1200,
    alt: "Design work in progress: page layouts, colour palette, typography and a sprint board",
  },
  serviceWeb: {
    src: photo("serviceWeb", "/images/service-web.svg"),
    width: 1200,
    height: 800,
    alt: "A business website homepage open in a laptop browser",
  },
  serviceCloud: {
    src: photo("serviceCloud", "/images/service-cloud.svg"),
    width: 900,
    height: 700,
    alt: "Hosting dashboard showing uptime, response time, SSL and backup status",
  },
  caseStudyFeature: {
    src: photo("caseStudyFeature", "/images/case-tera.svg"),
    width: 1000,
    height: 800,
    alt: "Sales dashboard with revenue, orders and channel breakdown",
  },
  projectMedicare: {
    src: photo("projectMedicare", "/images/project-medicare.svg"),
    width: 900,
    height: 1000,
    alt: "Clinic appointment-booking app on two phones: doctor list and slot picker",
  },
  skillsGap: {
    src: photo("skillsGap", "/images/skills-gap.svg"),
    width: 1400,
    height: 900,
    alt: "Team sprint board with tasks, owners, progress and stand-up notes",
  },
  articleAutomation: {
    src: photo("articleAutomation", "/images/article-automation.svg"),
    width: 1200,
    height: 800,
    alt: "Automation flow from a WhatsApp enquiry to CRM lead, quote and email",
  },
  articleProcesses: {
    src: photo("articleProcesses", "/images/article-processes.svg"),
    width: 900,
    height: 700,
    alt: "A wireframe turning into the finished page design",
  },
  articleGrowth: {
    src: photo("articleGrowth", "/images/article-growth.svg"),
    width: 900,
    height: 700,
    alt: "Search result ranking first and an organic traffic chart rising",
  },
  /**
   * Figma 24:2647 — the dark halftone backdrop behind "All services" and the
   * process timeline. A render of the composited node (black + 13% texture),
   * 1920×1980 in the design; decorative.
   */
  servicesDarkBackdrop: {
    src: "/images/services-dark-bg.png",
    width: 993,
    height: 1024,
    alt: "",
  },
} as const satisfies Record<string, ImageSlot>;

export type ImageKey = keyof typeof images;
