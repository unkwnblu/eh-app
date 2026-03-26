/** Pulsing placeholder block used across all loading.tsx files. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-border/60 dark:bg-white/10 ${className}`}
    />
  );
}

/** Full-page loading shell: navbar placeholder + content area. */
export function PageSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar skeleton */}
      <div className="h-16 border-b border-gray-border dark:border-white/10 bg-white dark:bg-[#111827] px-6 flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <div className="hidden md:flex gap-6">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Hero skeleton */}
      <div className="bg-gray-soft dark:bg-[#0B1222] py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-5 w-full max-w-lg mt-2" />
          <div className="flex gap-3 mt-6">
            <Skeleton className="h-12 w-36 rounded-full" />
            <Skeleton className="h-12 w-36 rounded-full" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <Skeleton className="h-4 w-24 mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3 p-6 rounded-2xl border border-gray-border dark:border-white/10">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="bg-navy py-12 px-6">
        <div className="max-w-5xl mx-auto flex justify-between">
          <Skeleton className="h-6 w-28 bg-white/10" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-16 bg-white/10" />
            <Skeleton className="h-4 w-16 bg-white/10" />
            <Skeleton className="h-4 w-16 bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compact loading skeleton for auth/form pages (split panel). */
export function AuthSkeleton() {
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Form panel */}
      <div className="flex-1 flex flex-col px-8 py-12 bg-white dark:bg-[#111827] lg:max-w-[55%]">
        <div className="w-full max-w-md mx-auto space-y-6">
          <Skeleton className="h-7 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-7 w-7 rounded-full" />
            ))}
          </div>
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
      {/* Branded panel */}
      <div className="hidden lg:block flex-1 bg-navy" />
    </div>
  );
}
