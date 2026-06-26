import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading State for Products Page
 * 
 * WHY: Next.js App Router uses this automatically when:
 * 1. Data is fetching (suspense boundary)
 * 2. Navigation is pending
 * 
 * Matches the layout of the actual page for smooth transitions.
 */
export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-32 mb-8" />

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="hidden lg:block space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>

        <div className="lg:col-span-3">
          <Skeleton className="h-12 w-full rounded-lg mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-surface p-4 space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
