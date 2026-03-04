import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { TurnosList } from "@/components/turnos/turnos-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function TurnosPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]

  // Get upcoming and recent turnos
  const { data: turnosProximos } = await supabase
    .from("turnos")
    .select(
      `
      *,
      mascota:mascotas(*, cliente:clientes(*)),
      servicio:servicios(*)
    `,
    )
    .gte("fecha", today)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true })
    .limit(50)

  const { data: turnosPasados } = await supabase
    .from("turnos")
    .select(
      `
      *,
      mascota:mascotas(*, cliente:clientes(*)),
      servicio:servicios(*)
    `,
    )
    .lt("fecha", today)
    .order("fecha", { ascending: false })
    .order("hora", { ascending: true })
    .limit(20)

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title="Turnos"
        action={
          <Link href="/turnos/nuevo">
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              Nuevo
            </Button>
          </Link>
        }
      />
      <main className="flex-1 px-4 py-4">
        <TurnosList turnosProximos={turnosProximos || []} turnosPasados={turnosPasados || []} />
      </main>
      <BottomNav />
    </div>
  )
}
