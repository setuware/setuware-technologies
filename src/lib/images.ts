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
    alt: "Two developers reviewing code together on a laptop",
  },
  aboutOffice: {
    src: photo("aboutOffice", "/images/about-office.svg"),
    width: 1080,
    height: 1200,
    alt: "A small team collaborating around a laptop in a bright studio",
  },
  serviceWeb: {
    src: photo("serviceWeb", "/images/service-web.svg"),
    width: 1200,
    height: 800,
    alt: "A website open on a laptop on a wooden desk",
  },
  serviceCloud: {
    src: photo("serviceCloud", "/images/service-cloud.svg"),
    width: 900,
    height: 700,
    alt: "Server racks in a data centre",
  },
  caseStudyFeature: {
    src: photo("caseStudyFeature", "/images/case-tera.svg"),
    width: 1000,
    height: 800,
    alt: "A business owner reviewing sales charts on a laptop",
  },
  projectMedicare: {
    src: photo("projectMedicare", "/images/project-medicare.svg"),
    width: 900,
    height: 1000,
    alt: "A person using an app on a smartphone",
  },
  skillsGap: {
    src: photo("skillsGap", "/images/skills-gap.svg"),
    width: 1400,
    height: 900,
    alt: "A team of colleagues discussing a project around a laptop",
  },
  articleAutomation: {
    src: photo("articleAutomation", "/images/article-automation.svg"),
    width: 1200,
    height: 800,
    alt: "Developers working at their desks in an open-plan office",
  },
  articleProcesses: {
    src: photo("articleProcesses", "/images/article-processes.svg"),
    width: 900,
    height: 700,
    alt: "Website wireframes sketched in a notebook beside a phone",
  },
  articleGrowth: {
    src: photo("articleGrowth", "/images/article-growth.svg"),
    width: 900,
    height: 700,
    alt: "A team reviewing growth metrics on a display",
  },
  /*
   * Team photography (free Pexels licence), cropped and encoded under
   * public/images/team/. Pexels ids: teamGroup 7581117, teamPortrait 8636650,
   * teamLaptop 3182812, teamWorkshop 3184360, clientMeeting 3184291.
   */
  teamGroup: {
    src: "/images/team/team-group.jpg",
    width: 1600,
    height: 1200,
    alt: "Four smiling colleagues gathered by their desks in a bright office",
  },
  teamPortrait: {
    src: "/images/team/team-portrait.jpg",
    width: 1200,
    height: 900,
    alt: "Four colleagues standing together and smiling in an office",
  },
  teamLaptop: {
    src: "/images/team/team-laptop.jpg",
    width: 1200,
    height: 900,
    alt: "A team gathered around a laptop, reviewing work together",
  },
  teamWorkshop: {
    src: "/images/team/team-workshop.jpg",
    width: 1200,
    height: 900,
    alt: "Colleagues working on laptops around a shared table during a planning session",
  },
  clientMeeting: {
    src: "/images/team/client-meeting.jpg",
    width: 1400,
    height: 1400,
    alt: "Colleagues shaking hands across a meeting table at the start of a project",
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
