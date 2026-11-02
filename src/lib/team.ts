/**
 * People shown on the site. Facts only: nothing here may be invented.
 */

export interface TeamMember {
  name: string;
  role: string;
  /** Initials for the avatar shown while there is no photo. */
  initials: string;
  email: string;
  location: string;
  bio: string;
  quote: string;
  /** Path under `public/`, e.g. "/images/team/satyam-raj.jpg". Optional. */
  photo?: string;
  /** Full LinkedIn profile URL. The LinkedIn button is shown only when set. */
  linkedin?: string;
}

// TODO(owner): add photo, bio and LinkedIn
export const founder: TeamMember = {
  name: "Satyam Raj",
  role: "Founder, Setuware Technologies",
  initials: "SR",
  email: "satyam.raj@setuware.in",
  location: "Gurugram",
  bio: "Satyam founded Setuware Technologies to give growing businesses a dependable technology partner. He leads client engagements from the first consultation through delivery.",
  quote: "Every project should leave the client with something they own, understand and can grow.",
};
