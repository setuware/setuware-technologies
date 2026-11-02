/**
 * Blog post metadata.
 *
 * Article bodies live in `post-bodies.ts` and are loaded only by the article
 * page. Keeping them out of here matters: the command palette and the header's
 * mega-menu both read post metadata on the client, and bundling every
 * article's prose alongside it pushed the first-load JavaScript over budget.
 */

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingMinutes: number;
  category: string;
  author: { name: string; role: string; initials: string };
  accent: readonly [string, string];
  featured: boolean;
  /**
   * Cover photo (free Pexels licence), cropped to 1200×800 under
   * `public/images/blog/`. Used by the homepage cards, /blog and the article
   * hero, so a post looks the same wherever it appears.
   */
  cover: PostCover;
}

export interface PostCover {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const cover = (slug: string, alt: string): PostCover => ({
  src: `/images/blog/${slug}.jpg`,
  alt,
  width: 1200,
  height: 800,
});

export const posts: readonly Post[] = [
  {
    slug: "surviving-a-traffic-spike",
    title: "How to prepare your website for sudden traffic spikes",
    excerpt:
      "Spikes rarely kill a site because of raw CPU. They kill it because one uncached query sits in the hot path. Here is the order we fix things in.",
    date: "2026-09-18",
    readingMinutes: 9,
    category: "Engineering",
    author: { name: "Harsh Jain", role: "Principal Engineer", initials: "HJ" },
    accent: ["#6366f1", "#22d3ee"],
    featured: true,
    cover: cover(
      "surviving-a-traffic-spike",
      "A software engineer reviewing code across two monitors at his desk",
    ),
  },
  {
    slug: "fixed-price-software-honestly",
    title: "How we quote fixed-price software without padding the number",
    excerpt:
      "Fixed price usually means one of two things: the agency added 40% for risk, or they plan to argue about scope later. There is a third option.",
    date: "2026-08-02",
    readingMinutes: 7,
    category: "Working together",
    author: { name: "Priya Manik", role: "Delivery Lead", initials: "PM" },
    accent: ["#8b5cf6", "#ec4899"],
    featured: true,
    cover: cover(
      "fixed-price-software-honestly",
      "Two colleagues planning a project together over a laptop and a notebook",
    ),
  },
  {
    slug: "choosing-managed-hosting",
    title: "Managed hosting explained: what your plan should include",
    excerpt:
      "A ₹500 VPS and a ₹25,000 managed plan both run your app. The difference shows up at 2am on a Saturday.",
    date: "2026-06-21",
    readingMinutes: 6,
    category: "Infrastructure",
    author: { name: "Harsh Jain", role: "Principal Engineer", initials: "HJ" },
    accent: ["#06b6d4", "#10b981"],
    featured: true,
    cover: cover(
      "choosing-managed-hosting",
      "An engineer checking systems on a laptop in a server room",
    ),
  },
  {
    slug: "animation-without-wrecking-performance",
    title: "Animating a marketing site without wrecking its performance",
    excerpt:
      "Motion sells. Motion also ships megabytes of JavaScript and drops frames on mid-range Android. Both can be true; here is the budget we work to.",
    date: "2026-05-09",
    readingMinutes: 8,
    category: "Frontend",
    author: { name: "Priya Manik", role: "Delivery Lead", initials: "PM" },
    accent: ["#f59e0b", "#ef4444"],
    featured: false,
    cover: cover(
      "animation-without-wrecking-performance",
      "A front-end developer working across two monitors and a laptop in an open-plan office",
    ),
  },
];

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

/** Newest first; the source array is left untouched. */
export const postsByDate = [...posts].sort((a, b) => b.date.localeCompare(a.date));

export const featuredPosts = postsByDate.filter((post) => post.featured);

export function relatedPosts(slug: string, limit = 3): Post[] {
  const current = getPost(slug);
  if (!current) return postsByDate.slice(0, limit);
  return postsByDate
    .filter((post) => post.slug !== slug)
    .sort((a, b) => {
      const aMatch = a.category === current.category ? 0 : 1;
      const bMatch = b.category === current.category ? 0 : 1;
      return aMatch - bMatch;
    })
    .slice(0, limit);
}
