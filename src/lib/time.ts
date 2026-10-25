import { cacheLife } from "next/cache";

/**
 * Time values for prerendered pages.
 *
 * Reading the clock directly during a render makes the output non-deterministic,
 * which Cache Components rejects — correctly, since a prerendered page would
 * otherwise freeze whatever moment the build happened to run at. Wrapping it in
 * `use cache` with a daily lifetime makes the value explicitly cached and
 * revalidated instead.
 */

export async function currentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function currentDateIso(): Promise<string> {
  "use cache";
  cacheLife("days");
  return new Date().toISOString();
}
