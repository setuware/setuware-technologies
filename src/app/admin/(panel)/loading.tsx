/** Skeleton shown inside the admin while a page loads. */
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-foreground/[0.07]" />
      <div className="mt-2 h-4 w-80 max-w-full rounded bg-foreground/[0.05]" />
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-foreground/[0.05]" />
        ))}
      </div>
      <div className="mt-6 h-72 rounded-2xl bg-foreground/[0.05]" />
    </div>
  );
}
