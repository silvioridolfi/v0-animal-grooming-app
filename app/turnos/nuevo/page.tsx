import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { NuevoTurnoForm } from "@/components/turnos/nuevo-turno-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function NuevoTurnoPage({
  searchParams,
}: {
  searchParams: Promise<{ fecha?: string; hora?: string }>
}) {
  const { fecha, hora } = await searchParams
  const supabase = await createClient()

  const { data: mascotas } = await supabase.from("mascotas").select("*, cliente:clientes(*)").order("nombre")

  const { data: config } = await supabase.from("configuracion_negocio").select("*").single()

  const { data: turnosExistentes } = await supabase
    .from("turnos")
    .select("id, fecha, hora, estado")
    .neq("estado", "cancelado")

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title="Nuevo turno"
        action={
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />
      <main className="flex-1 px-4 py-4">
        <NuevoTurnoForm
          mascotas={mascotas || []}
          config={config}
          turnosExistentes={turnosExistentes || []}
          fechaInicial={fecha}
          horaInicial={hora}
        />
      </main>
      <BottomNav />
    </div>
  )
}
