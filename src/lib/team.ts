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
  /** Personal profile URLs. Each button is shown only when its URL is set. */
  linkedin?: string;
  github?: string;
  x?: string;
}

// TODO(owner): add photo and bio
export const founder: TeamMember = {
  name: "Satyam Raj",
  role: "Founder, Setuware Technologies",
  initials: "SR",
  email: "satyam.raj@setuware.in",
  location: "Gurugram",
  bio: "Satyam founded Setuware Technologies to give growing businesses a dependable technology partner. He leads client engagements from the first consultation through delivery.",
  quote: "Every project should leave the client with something they own, understand and can grow.",
  linkedin: "https://www.linkedin.com/in/satyamraj1/",
  github: "https://github.com/stymrj",
  x: "https://x.com/ersatyamraj",
};
