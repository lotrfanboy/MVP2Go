export default function DashboardLoading() {
  return (
    <main className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl border bg-muted/40" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl border bg-muted/30" />
    </main>
  );
}
