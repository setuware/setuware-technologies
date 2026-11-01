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
    alt: "Two Setuware Technologies engineers reviewing a build together at a desk",
  },
  aboutOffice: {
    src: photo("aboutOffice", "/images/about-office.svg"),
    width: 1080,
    height: 1200,
    alt: "The Setuware Technologies studio, with the team working in an open-plan space",
  },
  serviceWeb: {
    src: photo("serviceWeb", "/images/service-web.svg"),
    width: 1200,
    height: 800,
    alt: "A web application dashboard open on a desktop monitor",
  },
  serviceCloud: {
    src: photo("serviceCloud", "/images/service-cloud.svg"),
    width: 900,
    height: 700,
    alt: "Cloud infrastructure visualised as layered network traffic",
  },
  caseStudyFeature: {
    src: photo("caseStudyFeature", "/images/case-tera.svg"),
    width: 1000,
    height: 800,
    alt: "A Tera technician using the platform on the factory floor",
  },
  projectMedicare: {
    src: photo("projectMedicare", "/images/project-medicare.svg"),
    width: 900,
    height: 1000,
    alt: "The MediCare app open on a phone, showing a patient's appointments",
  },
  skillsGap: {
    src: photo("skillsGap", "/images/skills-gap.svg"),
    width: 1400,
    height: 900,
    alt: "A product lead in conversation during a planning session",
  },
  articleAutomation: {
    src: photo("articleAutomation", "/images/article-automation.svg"),
    width: 1200,
    height: 800,
    alt: "Notes and a laptop on a desk during a process-automation workshop",
  },
  articleProcesses: {
    src: photo("articleProcesses", "/images/article-processes.svg"),
    width: 900,
    height: 700,
    alt: "A tablet showing a business process being mapped out",
  },
  articleGrowth: {
    src: photo("articleGrowth", "/images/article-growth.svg"),
    width: 900,
    height: 700,
    alt: "A team reviewing growth metrics together on a shared screen",
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
