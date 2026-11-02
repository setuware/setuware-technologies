/**
 * Cover photos for the case studies (Pexels, free licence; no attribution
 * required). 1200×800, cropped from the originals by id.
 */
export interface CaseStudyPhoto {
  src: string;
  alt: string;
  /** https://www.pexels.com/photo/<id>/ — kept for the record, not displayed. */
  pexelsId: number;
}

export const caseStudyPhotos: Record<string, CaseStudyPhoto> = {
  "kirana-commerce-platform": {
    src: "/images/work/kirana-commerce-platform.jpg",
    alt: "Supermarket aisles stocked with groceries",
    pexelsId: 32550092,
  },
  "field-service-mobile-app": {
    src: "/images/work/field-service-mobile-app.jpg",
    alt: "A technician servicing network equipment",
    pexelsId: 442154,
  },
  "clinic-support-desk-ai": {
    src: "/images/work/clinic-support-desk-ai.jpg",
    alt: "A doctor and a patient reviewing information on a tablet",
    pexelsId: 4266947,
  },
  "fintech-dashboard-rebuild": {
    src: "/images/work/fintech-dashboard-rebuild.jpg",
    alt: "Financial charts on a laptop and tablet on an office desk",
    pexelsId: 5831664,
  },
  "education-platform-hosting": {
    src: "/images/work/education-platform-hosting.jpg",
    alt: "Students working on laptops in a lecture hall",
    pexelsId: 8199165,
  },
  "logistics-brand-design-system": {
    src: "/images/work/logistics-brand-design-system.jpg",
    alt: "A delivery van loaded with parcels",
    pexelsId: 6407553,
  },
};

export function caseStudyPhoto(slug: string): CaseStudyPhoto | undefined {
  return caseStudyPhotos[slug];
}
