import { createClient } from "@/lib/supabase/server"
import { BottomNav } from "@/components/bottom-nav"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Phone, Dog, Cat, Plus, Edit, Trash2, Clock } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import type { Cliente, Mascota } from "@/lib/types"

interface ClienteWithMascotas extends Cliente {
  mascotas: Mascota[]
}

// UUID v4 validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Static routes that should not be matched by [id]
const STATIC_ROUTES = ["nuevo", "editar"]

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Redirect static routes to their actual pages
  if (STATIC_ROUTES.includes(id)) {
    redirect(`/clientes/${id}`)
  }

  // Validate UUID format before making database query
  if (!UUID_REGEX.test(id)) {
    notFound()
  }

  const supabase = await createClient()

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*, mascotas(*)")
    .eq("id", id)
    .single() as { data: ClienteWithMascotas | null }

  if (!cliente) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <PageHeader
        title={cliente.nombre}
        subtitle="Detalles del cliente"
        action={
          <Link href="/clientes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />
      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Información del cliente */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="font-semibold">{cliente.nombre}</p>
            </div>
            {cliente.telefono && (
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Teléfono
                </p>
                <p className="font-semibold">{cliente.telefono}</p>
              </div>
            )}
            {cliente.notas && (
              <div>
                <p className="text-xs text-muted-foreground">Notas</p>
                <p className="text-sm">{cliente.notas}</p>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Link href={`/clientes/${cliente.id}/editar`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-1 bg-transparent">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Mascotas del cliente */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Dog className="h-5 w-5" />
              Mascotas ({cliente.mascotas?.length || 0})
            </h2>
            <Link href="/mascotas/nueva">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Sumar Mascota</span>
                <span className="sm:hidden">Agregar</span>
              </Button>
            </Link>
          </div>

          {cliente.mascotas && cliente.mascotas.length > 0 ? (
            <div className="space-y-2">
              {cliente.mascotas.map((mascota) => (
                <Card key={mascota.id}>
                  <CardContent className="pt-4 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {mascota.tipo_animal === "Perro" ? (
                            <Dog className="h-5 w-5 text-primary" />
                          ) : (
                            <Cat className="h-5 w-5 text-primary" />
                          )}
                          <span className="font-semibold">{mascota.nombre}</span>
                          {mascota.sexo && (
                            <span className="text-xs text-muted-foreground">({mascota.sexo})</span>
                          )}
                        </div>
                        {mascota.raza && (
                          <p className="text-sm text-muted-foreground">{mascota.raza}</p>
                        )}
                        {mascota.tamano && (
                          <p className="text-xs text-muted-foreground">
                            Tamaño: {mascota.tamano === "S" ? "Pequeño" : mascota.tamano === "M" ? "Mediano" : "Grande"}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Link href={`/mascotas/${mascota.id}`} className="flex-1">
                          <Button variant="ghost" size="sm" className="w-full gap-1">
                            Ver detalles
                          </Button>
                        </Link>
                        <Link href={`/mascotas/${mascota.id}/historial`} title="Ver historial de servicios y precios">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Historial">
                            <Clock className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/mascotas/${mascota.id}/editar`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-4 text-center text-muted-foreground">
                <p>No hay mascotas registradas</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
