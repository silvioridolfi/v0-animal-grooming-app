import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/page-header"
import { HistorialServicios } from "@/components/mascota/historial-servicios"
import { BottomNav } from "@/components/bottom-nav"
import { BackButton } from "@/components/mascotas/back-button"

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

  const historial = (turnos || []).map((t) => ({
    id: t.id,
    mascota_id: t.mascota_id,
    turno_id: t.id,
    tipo_servicio: t.tipo_servicio,
    fecha_servicio: t.fecha,
    precio: t.precio_final || 0,
    metodo_pago: t.metodo_pago || null,
    estado_turno: t.estado,
    created_at: t.created_at,
  }))

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title={`Historial — ${mascota.nombre}`}
        action={<BackButton />}
      />
      <main className="flex-1 px-4 py-4">
        <HistorialServicios historial={historial} />
      </main>
      <BottomNav />
    </div>
  )
}