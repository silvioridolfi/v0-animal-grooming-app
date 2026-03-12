import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/page-header"
import { HistorialServicios } from "@/components/mascota/historial-servicios"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface MascotaHistorialPageProps {
  params: Promise<{ id: string }>
}

export default async function MascotaHistorialPage({ params }: MascotaHistorialPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: mascota, error: errorMascota } = await supabase
    .from("mascotas")
    .select("*, cliente:clientes(*)")
    .eq("id", id)
    .single()

  if (errorMascota || !mascota) notFound()

  const { data: turnos = [] } = await supabase
    .from("turnos")
    .select("*")
    .eq("mascota_id", id)
    .eq("estado", "realizado")
    .order("fecha", { ascending: false })

  // Transformar turnos al formato que espera HistorialServicios
  const historial = (turnos || []).map((t) => ({
    id: t.id,
    tipo_servicio: t.tipo_servicio,
    fecha_servicio: t.fecha,
    precio: t.precio_final || 0,
    metodo_pago: t.metodo_pago || null,
  }))

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title={`Historial — ${mascota.nombre}`}
        action={
          <Link href={`/mascotas/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />
      <main className="flex-1 px-4 py-4">
        <HistorialServicios historial={historial} />
      </main>
      <BottomNav />
    </div>
  )
}