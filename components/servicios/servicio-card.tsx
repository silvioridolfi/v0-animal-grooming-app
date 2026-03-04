"use client"

import { useState } from "react"
import type { Servicio, ServicioPrecio } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Pencil, Dog, Cat, Trash2 } from "lucide-react"
import { toggleServicioActivo, eliminarServicio } from "@/lib/actions/servicios"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ServicioCardProps {
  servicio: Servicio & { precios?: ServicioPrecio[] }
}

export function ServicioCard({ servicio }: ServicioCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleToggleActivo = async () => {
    setIsLoading(true)
    await toggleServicioActivo(servicio.id, !servicio.activo)
    setIsLoading(false)
  }

  const handleEliminar = async () => {
    setIsLoading(true)
    const result = await eliminarServicio(servicio.id)
    if (result.error) {
      alert(`No se puede eliminar: ${result.error}`)
    } else if (result.success) {
      // Cerrar diálogo si se eliminó correctamente
      setShowDeleteDialog(false)
    }
    setIsLoading(false)
  }

  const precioChico = servicio.precios?.find((p) => p.tamano === "S")?.precio
  const precioMediano = servicio.precios?.find((p) => p.tamano === "M")?.precio
  const precioGrande = servicio.precios?.find((p) => p.tamano === "L")?.precio

  return (
    <>
      <Card className={cn(!servicio.activo && "opacity-60")}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{servicio.nombre}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {servicio.tipo_animal === "Perro" && <Dog className="h-3 w-3" />}
                  {servicio.tipo_animal === "Gato" && <Cat className="h-3 w-3" />}
                  {servicio.tipo_animal === "Ambos" && (
                    <>
                      <Dog className="h-3 w-3" />
                      <Cat className="h-3 w-3" />
                    </>
                  )}
                  {servicio.tipo_animal}
                </span>
              </div>

              <div className="space-y-1">
                {precioChico !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Chico:</span> ${Number(precioChico).toLocaleString("es-AR")}
                  </p>
                )}
                {precioMediano !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Mediano:</span> ${Number(precioMediano).toLocaleString("es-AR")}
                  </p>
                )}
                {precioGrande !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Grande:</span> ${Number(precioGrande).toLocaleString("es-AR")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={servicio.activo} onCheckedChange={handleToggleActivo} disabled={isLoading} />
              <Link href={`/servicios/${servicio.id}/editar`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas eliminar el servicio <strong>{servicio.nombre}</strong>? Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
