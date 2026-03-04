import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/page-header"
import { HistorialServicios } from "@/components/mascota/historial-servicios"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface MascotaHistorialPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function MascotaHistorialPage({ params }: MascotaHistorialPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Obtener información de la mascota
  const { data: mascota, error: errorMascota } = await supabase
    .from("mascotas")
    .select("*")
    .eq("id", id)
    .single()

  if (errorMascota || !mascota) {
    notFound()
  }

  // Obtener historial de servicios
  const { data: historial = [] } = await supabase
    .from("historial_servicios")
    .select("*")
    .eq("mascota_id", id)
    .order("fecha_servicio", { ascending: false })

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title={`Historial - ${mascota.nombre}`}
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
        <HistorialServicios historial={historial} />
      </main>
    </div>
  )
}
