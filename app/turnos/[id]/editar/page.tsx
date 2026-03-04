import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { EditarTurnoForm } from "@/components/turnos/editar-turno-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditarTurnoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: turno } = await supabase.from("turnos").select("*").eq("id", id).single()

  if (!turno) {
    notFound()
  }

  const { data: mascotas } = await supabase.from("mascotas").select("*, cliente:clientes(*)").order("nombre")

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title="Editar turno"
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
        <EditarTurnoForm turno={turno} mascotas={mascotas || []} />
      </main>
      <BottomNav />
    </div>
  )
}
