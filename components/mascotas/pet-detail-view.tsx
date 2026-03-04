"use client"

import { useState } from "react"
import type { PetHistoryEntry, Mascota } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dog, Cat, Trash2, Edit, DollarSign, Calendar, Tag, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { eliminarMascota } from "@/lib/actions/mascotas"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface PetDetailViewProps {
  mascota: Mascota
  history: PetHistoryEntry[]
  clienteNombre: string
}

export function PetDetailView({ mascota, history, clienteNombre }: PetDetailViewProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await eliminarMascota(mascota.id)
    if (result.success) {
      router.push(`/clientes/${mascota.cliente_id}`)
    }
    setIsDeleting(false)
  }

  const totalServicios = history.length
  const totalGastado = history.reduce((sum, h) => sum + h.precio_total, 0)
  const ultimoServicio = history[0]

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {mascota.tipo_animal === "Perro" ? <Dog className="h-8 w-8 text-primary" /> : <Cat className="h-8 w-8 text-primary" />}
              <div>
                <CardTitle className="text-2xl">{mascota.nombre}</CardTitle>
                <p className="text-sm text-muted-foreground">{clienteNombre}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/mascotas/${mascota.id}/historial`}>
                <Button variant="outline" size="sm" title="Ver historial completo">
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Historial</span>
                </Button>
              </Link>
              <Link href={`/mascotas/${mascota.id}/editar`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Tipo</p>
              <p className="font-medium">{mascota.tipo_animal}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Tamaño</p>
              <p className="font-medium">{mascota.tamano || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Raza</p>
              <p className="font-medium">{mascota.raza || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Sexo</p>
              <p className="font-medium">{mascota.sexo || "—"}</p>
            </div>
          </div>
          {mascota.notas && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground uppercase mb-1">Notas</p>
              <p className="text-sm text-muted-foreground">{mascota.notas}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalServicios}</p>
            <p className="text-xs text-muted-foreground mt-1">Servicios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">${totalGastado.toLocaleString("es-AR")}</p>
            <p className="text-xs text-muted-foreground mt-1">Gastado</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{ultimoServicio ? new Date(ultimoServicio.fecha_servicio).toLocaleDateString("es-AR", { month: "short", day: "numeric" }) : "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">Último</p>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Historial de servicios</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay servicios registrados aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50 border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{entry.tipo_servicio}</p>
                      <Badge
                        variant={
                          entry.estado === "realizado"
                            ? "default"
                            : entry.estado === "pendiente"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {entry.estado}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(entry.fecha_servicio).toLocaleDateString("es-AR")}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        ${entry.precio_total.toLocaleString("es-AR")}
                      </div>
                      {entry.metodo_pago && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" />
                          {entry.metodo_pago === "efectivo" ? "💵 Efectivo" : "🔄 Transferencia"}
                        </div>
                      )}
                    </div>
                    {entry.notas && <p className="text-xs text-muted-foreground mt-2 italic">{entry.notas}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mascota</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a {mascota.nombre}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
