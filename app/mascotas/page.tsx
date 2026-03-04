import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { MascotasList } from "@/components/mascotas/mascotas-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function MascotasPage() {
  const supabase = await createClient()

  const { data: mascotas } = await supabase
    .from("mascotas")
    .select("*, cliente:clientes(*)")
    .order("nombre", { ascending: true })

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title="Mascotas"
        subtitle={`${mascotas?.length || 0} mascotas registradas`}
        action={
          <Link href="/mascotas/nueva">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva mascota
            </Button>
          </Link>
        }
      />
      <main className="flex-1 px-4 py-4">
        <MascotasList mascotas={mascotas || []} />
      </main>
      <BottomNav />
    </div>
  )
}
