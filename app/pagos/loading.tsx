import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
