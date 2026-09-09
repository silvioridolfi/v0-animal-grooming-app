import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-6 w-24 mb-1" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="flex-1 p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
