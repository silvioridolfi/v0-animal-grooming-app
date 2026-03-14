import { Suspense } from "react"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { BuscarPageClient } from "@/components/buscar/buscar-page-client"

export default function BuscarPage() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader title="Buscar" />
      <main className="flex-1 px-4 py-4">
        <Suspense fallback={<div className="text-center text-muted-foreground py-8">Cargando...</div>}>
          <BuscarPageClient />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  )
}