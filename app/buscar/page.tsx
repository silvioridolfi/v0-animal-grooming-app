import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { BuscarPageClient } from "@/components/buscar/buscar-page-client"
import { Skeleton } from "@/components/ui/skeleton"

function BuscarFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full rounded-lg" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}

export default function BuscarPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="Buscar" />
      <main className="flex-1 px-4 py-4">
        <Suspense fallback={<BuscarFallback />}>
          <BuscarPageClient />
        </Suspense>
      </main>
    </div>
  )
}