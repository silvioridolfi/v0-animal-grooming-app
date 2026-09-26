import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      <div className="flex-1 px-4 py-4">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-56 w-full rounded-lg" />
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </div>
    </div>
  )
}
