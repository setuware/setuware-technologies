import { cacheLife, cacheTag } from "next/cache";

import type { Job } from "@/lib/careers";
import type { Block } from "@/lib/post-bodies";
import type { Post } from "@/lib/posts";

import {
  openJobBySlug,
  openJobRecords,
  postBlocks,
  publishedPostBySlug,
  publishedPostRecords,
  toJob,
  toPost,
} from "./store";

/**
 * Cached readers for the public site. Saving in the admin calls
 * `updateTag(CMS_TAGS.…)`, so changes show on the next request; the short
 * cache life also brings scheduled posts online within a few minutes.
 */

export const CMS_TAGS = { posts: "cms-posts", jobs: "cms-jobs" } as const;

export type PublicJob = Job & { postedAt: string };

export async function getPublishedPosts(): Promise<Post[]> {
  "use cache";
  cacheTag(CMS_TAGS.posts);
  cacheLife("minutes");
  return publishedPostRecords().map(toPost);
}

export async function getPublishedPost(slug: string): Promise<{ post: Post; blocks: Block[] } | null> {
  "use cache";
  cacheTag(CMS_TAGS.posts);
  cacheLife("minutes");
  const record = publishedPostBySlug(slug);
  return record ? { post: toPost(record), blocks: postBlocks(record) } : null;
}

export async function getOpenJobs(): Promise<PublicJob[]> {
  "use cache";
  cacheTag(CMS_TAGS.jobs);
  cacheLife("minutes");
  return openJobRecords().map(toJob);
}

export async function getOpenJob(slug: string): Promise<PublicJob | null> {
  "use cache";
  cacheTag(CMS_TAGS.jobs);
  cacheLife("minutes");
  const record = openJobBySlug(slug);
  return record ? toJob(record) : null;
}
