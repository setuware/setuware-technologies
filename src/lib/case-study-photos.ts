/**
 * Visuals for the case studies: screenshots of the live client sites,
 * captured at 1440×900 (desktop, 2400×1500 JPEG) and 390×844 (mobile, 2×).
 */
export interface CaseStudyPhoto {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Phone-width screenshot of the same site. */
  mobile?: { src: string; width: number; height: number };
}

export const caseStudyPhotos: Record<string, CaseStudyPhoto> = {
  "engineering-expert-learning-platform": {
    src: "/images/work/engineering-expert-learning-platform-desktop.jpg",
    alt: "My Engineering Expert home page: course search, live classes and on-demand video",
    width: 2400,
    height: 1500,
    mobile: {
      src: "/images/work/engineering-expert-learning-platform-mobile.jpg",
      width: 780,
      height: 1688,
    },
  },
  "sanskar-kabir-couture-ecommerce": {
    src: "/images/work/sanskar-kabir-couture-ecommerce-desktop.jpg",
    alt: "Sanskar & Kabir online store: occasionwear collections and the occasion edit",
    width: 2400,
    height: 1500,
    mobile: {
      src: "/images/work/sanskar-kabir-couture-ecommerce-mobile.jpg",
      width: 780,
      height: 1688,
    },
  },
};

export function caseStudyPhoto(slug: string): CaseStudyPhoto | undefined {
  return caseStudyPhotos[slug];
}
