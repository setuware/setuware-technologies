import { Skeleton } from "@/components/ui/skeleton";

/** Shown while a route's static shell streams in. Mirrors the common page shape. */
export default function Loading() {
  return (
    <div className="container-page py-28" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-11 w-full max-w-lg" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-60" />
        ))}
      </div>
    </div>
  );
}
