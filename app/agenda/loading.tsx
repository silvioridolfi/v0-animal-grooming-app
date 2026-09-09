import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex-1 px-4 py-4 space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
