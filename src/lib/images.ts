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

export interface ImageSlot {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export const images = {
  heroBackdrop: {
    src: "/images/hero-team.svg",
    width: 1920,
    height: 1080,
    alt: "Two Setuware engineers reviewing a build together at a desk",
  },
  aboutOffice: {
    src: "/images/about-office.svg",
    width: 1080,
    height: 1200,
    alt: "The Setuware studio, with the team working in an open-plan space",
  },
  serviceWeb: {
    src: "/images/service-web.svg",
    width: 1200,
    height: 800,
    alt: "A web application dashboard open on a desktop monitor",
  },
  serviceCloud: {
    src: "/images/service-cloud.svg",
    width: 900,
    height: 700,
    alt: "Cloud infrastructure visualised as layered network traffic",
  },
  caseStudyFeature: {
    src: "/images/case-tera.svg",
    width: 1000,
    height: 800,
    alt: "A Tera technician using the platform on the factory floor",
  },
  projectMedicare: {
    src: "/images/project-medicare.svg",
    width: 900,
    height: 1000,
    alt: "The MediCare app open on a phone, showing a patient's appointments",
  },
  skillsGap: {
    src: "/images/skills-gap.svg",
    width: 1400,
    height: 900,
    alt: "A product lead in conversation during a planning session",
  },
  articleAutomation: {
    src: "/images/article-automation.svg",
    width: 1200,
    height: 800,
    alt: "Notes and a laptop on a desk during a process-automation workshop",
  },
  articleProcesses: {
    src: "/images/article-processes.svg",
    width: 900,
    height: 700,
    alt: "A tablet showing a business process being mapped out",
  },
  articleGrowth: {
    src: "/images/article-growth.svg",
    width: 900,
    height: 700,
    alt: "A team reviewing growth metrics together on a shared screen",
  },
} as const satisfies Record<string, ImageSlot>;

export type ImageKey = keyof typeof images;
