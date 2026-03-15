import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { PetDetailView } from "@/components/mascotas/pet-detail-view"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { obtenerHistorialMascota, obtenerProximoTurno } from "@/lib/actions/mascotas"
import { BackButton } from "@/components/mascotas/back-button"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const STATIC_ROUTES = ["nueva", "editar", "historial"]

export default async function MascotaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (STATIC_ROUTES.includes(id)) {
    redirect(`/mascotas/${id}`)
  }

  if (!UUID_REGEX.test(id)) {
    notFound()
  }

  const supabase = await createClient()

  const { data: mascota, error } = await supabase
    .from("mascotas")
    .select("*, cliente:clientes(*)")
    .eq("id", id)
    .single()

  if (!mascota) {
    return (
      <div className="flex min-h-screen flex-col pb-20">
        <PageHeader
          title="Mascota"
          action={<BackButton />}
        />
        <main className="flex-1 px-4 py-4 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">Cargando información de la mascota...</p>
            <Link href="/mascotas">
              <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                Volver a mascotas
              </Button>
            </Link>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col pb-20">
        <PageHeader
          title="Mascota"
          action={<BackButton />}
        />
        <main className="flex-1 px-4 py-4">
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Error al cargar mascota</p>
              <p className="text-sm text-red-700 mt-1">{error.message}</p>
              <Link href="/mascotas">
                <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                  Volver a mascotas
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  const [{ history }, proximoTurno] = await Promise.all([
    obtenerHistorialMascota(id),
    obtenerProximoTurno(id),
  ])

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title={mascota.nombre}
        action={<BackButton />}
      />
      <main className="flex-1 px-4 py-4">
        <PetDetailView
          mascota={mascota}
          history={history}
          clienteNombre={mascota.cliente?.nombre || "Cliente desconocido"}
          proximoTurno={proximoTurno}
        />
      </main>
      <BottomNav />
    </div>
  )
}