import { cn } from "@/lib/utils";

/** Placeholder used by lazily mounted sections to hold their space. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-surface-2 motion-reduce:animate-none",
        className,
      )}
    />
  );
}

export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="container-page py-20" aria-hidden>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-56" />
        ))}
      </div>
    </div>
  );
}
