import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-6 w-32 mb-1" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex-1 px-4 py-4 space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
